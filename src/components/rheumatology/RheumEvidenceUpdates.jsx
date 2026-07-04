import React, { useState } from "react";
import { base44 } from "@/api/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  RefreshCw, Loader2, CheckCircle, Clock, User, Plus,
  BookOpen, History, ChevronDown, ChevronUp, Save, Shield,
  Award, AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const TOPICS = [
  "JIA Overall Recommendations",
  "sJIA and MAS Management",
  "Pediatric SLE (pSLE)",
  "Kawasaki Disease",
  "MIS-C",
  "IgA Vasculitis (HSP) Nephritis",
  "ANCA Vasculitis in Children",
  "JDM (Juvenile Dermatomyositis)",
  "FMF and Periodic Fevers",
  "Biologics Safety in Children",
  "Biologic Failure Strategies",
  "JAK Inhibitors in Pediatric Rheumatology",
  "Vaccination Guidelines on Immunosuppression",
];

const STORAGE_KEY = "rheum_evidence_updates";

function loadUpdates() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
}
function saveUpdatesStore(updates) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updates)); } catch {}
}

function UpdateEntry({ topic, entry, isAdmin }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white border border-green-200 rounded-xl overflow-hidden">
      <button className="w-full text-left p-3 hover:bg-green-50 transition-colors" onClick={() => setExpanded(e => !e)}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-slate-900">{topic}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge className="text-xs bg-green-100 text-green-800 border-0">
                <Clock className="w-2.5 h-2.5 mr-1" />{entry.timestamp}
              </Badge>
              <Badge variant="outline" className="text-xs">v{entry.version}</Badge>
              {entry.evidence_grade && (
                <Badge className="text-xs bg-blue-100 text-blue-800 border-0">
                  <Award className="w-2.5 h-2.5 mr-1" />{entry.evidence_grade}
                </Badge>
              )}
              {entry.reviewer && (
                <Badge className="text-xs bg-purple-100 text-purple-800 border-0">
                  <User className="w-2.5 h-2.5 mr-1" />Verified: {entry.reviewer}
                </Badge>
              )}
              {entry.source && (
                <Badge className="text-xs bg-slate-100 text-slate-700 border-0">
                  <BookOpen className="w-2.5 h-2.5 mr-1" />{entry.source}
                </Badge>
              )}
              <Badge className="text-xs bg-amber-100 text-amber-800 border-0">Latest Evidence</Badge>
            </div>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>
      {expanded && (
        <div className="border-t border-green-100 p-3 bg-green-50">
          {entry.admin_note && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-2.5 mb-3">
              <p className="text-xs font-bold text-purple-800 mb-1">
                <Shield className="w-3 h-3 inline mr-1" />Expert Annotation
              </p>
              <p className="text-xs text-purple-700">{entry.admin_note}</p>
            </div>
          )}
          <ReactMarkdown className="text-xs prose prose-sm prose-green max-w-none [&>*:first-child]:mt-0">
            {entry.content}
          </ReactMarkdown>
          {entry.change_summary && (
            <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-2">
              <p className="text-xs font-bold text-amber-800 mb-0.5">Change Summary</p>
              <p className="text-xs text-amber-700">{entry.change_summary}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function RheumEvidenceUpdates({ isAdmin }) {
  const [updates, setUpdates] = useState(loadUpdates);
  const [selectedTopic, setSelectedTopic] = useState(TOPICS[0]);
  const [loading, setLoading] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [changeSummary, setChangeSummary] = useState("");
  const [evidenceGrade, setEvidenceGrade] = useState("Moderate");
  const [reviewer, setReviewer] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const persistUpdates = (u) => {
    setUpdates(u);
    saveUpdatesStore(u);
  };

  const fetchUpdate = async (topic) => {
    setLoading(prev => ({ ...prev, [topic]: true }));
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a senior pediatric rheumatologist. Provide the latest 2024–2025 evidence summary for: "${topic}" in pediatric rheumatology. Include: new drug approvals (cite trial names), updated ACR/EULAR guidelines, key evidence changes, pediatric-specific updates. Use bullet points. Be comprehensive but concise.`,
        add_context_from_internet: true,
        model: "gemini_3_flash",
      });

      const entry = {
        content: result,
        timestamp: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
        version: ((updates[topic]?.version || 0) + 1),
        evidence_grade: evidenceGrade,
        reviewer: reviewer || (isAdmin ? "Admin" : undefined),
        source: "AI + ACR/EULAR 2024-2025 (Web Search)",
        admin_note: adminNote || undefined,
        change_summary: changeSummary || undefined,
        verified_by_expert: !!reviewer,
        published_at: new Date().toISOString(),
      };

      const prevHistory = updates[topic]?.history || [];
      const newUpdates = {
        ...updates,
        [topic]: {
          ...entry,
          history: updates[topic] ? [updates[topic], ...prevHistory].slice(0, 5) : prevHistory,
        },
      };
      persistUpdates(newUpdates);
      setAdminNote("");
      setChangeSummary("");
      toast.success(`Updated: ${topic}`);
    } catch (err) {
      toast.error("Fetch failed — check internet connection");
    } finally {
      setLoading(prev => ({ ...prev, [topic]: false }));
    }
  };

  const recentlyUpdated = Object.entries(updates)
    .sort((a, b) => new Date(b[1].published_at || 0) - new Date(a[1].published_at || 0))
    .slice(0, 5);

  return (
    <div className="space-y-3">
      <Alert className="bg-blue-50 border-blue-200">
        <BookOpen className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-xs text-blue-900">
          <strong>Dynamic Evidence Update System</strong> — AI-fetched latest guidelines with expert annotation.
          {isAdmin && <span className="text-purple-700 font-semibold"> Admin: fetch, annotate and publish updates.</span>}
        </AlertDescription>
      </Alert>

      {/* Admin controls */}
      {isAdmin && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 space-y-3">
          <p className="text-xs font-bold text-purple-800 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />Admin Evidence Update Controls
          </p>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Select Topic</label>
            <select value={selectedTopic} onChange={e => setSelectedTopic(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400">
              {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <button onClick={() => setShowAddForm(f => !f)}
            className="flex items-center gap-1 text-xs text-purple-700 font-semibold">
            <Plus className="w-3.5 h-3.5" />{showAddForm ? "Hide annotations" : "Add annotations before publishing"}
          </button>
          {showAddForm && (
            <div className="space-y-2">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Expert Annotation (optional)</label>
                <Textarea value={adminNote} onChange={e => setAdminNote(e.target.value)}
                  placeholder="Add curated note, clinical context, or guideline nuance…"
                  className="text-xs min-h-[60px]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Change Summary</label>
                <Textarea value={changeSummary} onChange={e => setChangeSummary(e.target.value)}
                  placeholder="What changed vs previous version…"
                  className="text-xs min-h-[40px]" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Evidence Grade</label>
                  <select value={evidenceGrade} onChange={e => setEvidenceGrade(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none">
                    <option>Strong</option><option>Moderate</option><option>Weak</option><option>Expert Opinion</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Reviewer Name</label>
                  <input value={reviewer} onChange={e => setReviewer(e.target.value)}
                    placeholder="Dr. Name" className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none" />
                </div>
              </div>
            </div>
          )}
          <Button onClick={() => fetchUpdate(selectedTopic)} disabled={loading[selectedTopic]}
            className="w-full bg-purple-600 hover:bg-purple-700 text-sm">
            {loading[selectedTopic]
              ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Fetching + Publishing…</>
              : <><RefreshCw className="w-4 h-4 mr-2" />Fetch Latest Evidence + Publish</>
            }
          </Button>
        </div>
      )}

      {/* Recently updated */}
      {recentlyUpdated.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />Recently Updated
          </p>
          <div className="space-y-2">
            {recentlyUpdated.map(([topic, entry]) => (
              <UpdateEntry key={topic} topic={topic} entry={entry} isAdmin={isAdmin} />
            ))}
          </div>
        </div>
      )}

      {/* Non-admin fetch buttons */}
      {!isAdmin && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Browse Evidence by Topic</p>
          <div className="grid grid-cols-2 gap-2">
            {TOPICS.slice(0, 6).map(topic => (
              <button key={topic}
                onClick={() => { setSelectedTopic(topic); fetchUpdate(topic); }}
                disabled={loading[topic]}
                className="p-2.5 rounded-xl border-2 border-slate-200 bg-white hover:border-blue-300 text-xs text-left transition-all">
                {loading[topic] ? (
                  <span className="flex items-center gap-1 text-blue-600">
                    <Loader2 className="w-3 h-3 animate-spin" />Fetching…
                  </span>
                ) : topic}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* All updates list */}
      {Object.keys(updates).length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p className="text-sm">No evidence updates yet.</p>
          {isAdmin && <p className="text-xs mt-1">Use the admin panel above to fetch and publish updates.</p>}
          {!isAdmin && <p className="text-xs mt-1">Updates will appear here when published by admin.</p>}
        </div>
      )}
    </div>
  );
}