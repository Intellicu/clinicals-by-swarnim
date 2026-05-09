/**
 * ADMIN GOVERNANCE QUEUE
 * Pending review queue for guidelines, definitions, and AI-enhanced content
 * Admin-only panel with full review workflow
 */
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck, Clock, CheckCircle, XCircle, Bot, Edit,
  History, AlertTriangle, FileText, ChevronDown, ChevronUp,
  Loader2, RefreshCw, Filter
} from "lucide-react";
import { REVIEW_STATUS } from "@/lib/clinicalOS/EvidenceGovernance";
import { toast } from "sonner";

const STATUS_FILTER_OPTIONS = [
  { label: "All Pending", value: "ALL" },
  { label: "AI Generated", value: "AI_GENERATED" },
  { label: "AI Suggestion", value: "AI_SUGGESTION" },
  { label: "Pending Review", value: "PENDING_REVIEW" },
  { label: "Draft", value: "DRAFT" },
];

function QueueItem({ guideline, user, onAction }) {
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const status = guideline.review_status || "DRAFT";
  const statusCfg = REVIEW_STATUS[status] || REVIEW_STATUS.DRAFT;
  const hasAIPending = guideline.ai_pending_sections?.length > 0;

  const handleAction = async (action) => {
    setSaving(true);
    try {
      await onAction(guideline, action, note);
      setNote("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`border-2 rounded-xl overflow-hidden ${
      status === "AI_GENERATED" || status === "AI_SUGGESTION" ? "border-amber-200" :
      status === "PENDING_REVIEW" ? "border-blue-200" : "border-slate-200"
    }`}>
      <button
        className={`w-full flex items-start gap-2.5 px-3 py-2.5 text-left hover:brightness-95 transition-all ${
          status === "AI_GENERATED" ? "bg-amber-50" :
          status === "AI_SUGGESTION" ? "bg-purple-50" :
          status === "PENDING_REVIEW" ? "bg-blue-50" : "bg-slate-50"
        }`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900 leading-snug truncate">{guideline.title}</p>
          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${statusCfg.color}`}>
              {statusCfg.icon} {statusCfg.label}
            </span>
            {guideline.category && (
              <Badge variant="outline" className="text-xs py-0">{guideline.category}</Badge>
            )}
            {hasAIPending && (
              <span className="text-xs text-purple-600 font-semibold flex items-center gap-0.5">
                <Bot className="w-3 h-3" />{guideline.ai_pending_sections.length} AI sections
              </span>
            )}
          </div>
        </div>
        <div className="flex-shrink-0 text-xs text-slate-400">
          {guideline.updated_date && new Date(guideline.updated_date).toLocaleDateString()}
        </div>
        {expanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-1" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-1" />}
      </button>

      {expanded && (
        <div className="p-3 border-t border-slate-100 bg-white space-y-3">
          {/* Metadata */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><span className="text-slate-400">Source:</span> <strong>{guideline.source}</strong></div>
            <div><span className="text-slate-400">Year:</span> <strong>{guideline.year}</strong></div>
            {guideline.reviewed_by && <div className="col-span-2"><span className="text-slate-400">Last reviewed by:</span> <strong>{guideline.reviewed_by}</strong></div>}
          </div>

          {/* Summary snippet */}
          {guideline.scope_and_population && (
            <p className="text-xs text-slate-600 bg-slate-50 rounded-lg p-2 leading-relaxed line-clamp-3">
              {guideline.scope_and_population}
            </p>
          )}

          {/* AI pending sections */}
          {hasAIPending && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
              <p className="text-xs font-bold text-amber-800 mb-1 flex items-center gap-1">
                <Bot className="w-3 h-3" /> AI-Pending Sections ({guideline.ai_pending_sections.length})
              </p>
              {guideline.ai_pending_sections.map((section, i) => (
                <div key={i} className="text-xs text-amber-700">
                  <strong>{section.type}:</strong> {section.items?.slice(0, 2).join("; ")}
                  {section.items?.length > 2 && ` + ${section.items.length - 2} more`}
                </div>
              ))}
            </div>
          )}

          {/* Audit trail snippet */}
          {guideline.audit_trail?.length > 0 && (
            <div className="border border-slate-200 rounded-lg p-2">
              <p className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                <History className="w-3 h-3" /> Last action
              </p>
              {(() => {
                const last = guideline.audit_trail[guideline.audit_trail.length - 1];
                return (
                  <p className="text-xs text-slate-600">
                    <strong>{last.action}</strong> by {last.by} on {new Date(last.timestamp).toLocaleDateString()}
                    {last.note && ` — "${last.note}"`}
                  </p>
                );
              })()}
            </div>
          )}

          {/* Review note */}
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Add review note (optional)…"
            className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            rows={2}
          />

          {/* Actions */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-xs"
              onClick={() => handleAction("approved")}
              disabled={saving}
            >
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5 mr-1" />}
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50 text-xs"
              onClick={() => handleAction("rejected")}
              disabled={saving}
            >
              <XCircle className="w-3.5 h-3.5 mr-1" />
              Reject
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-amber-300 text-amber-600 hover:bg-amber-50 text-xs"
              onClick={() => handleAction("flagged_for_review")}
              disabled={saving}
            >
              <Clock className="w-3.5 h-3.5 mr-1" />
              Flag
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminGovernanceQueue({ user }) {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const queryClient = useQueryClient();

  const isAdmin = user?.role === "admin";

  const { data: guidelines = [], isLoading, refetch } = useQuery({
    queryKey: ["guidelines_pending"],
    queryFn: () => base44.entities.Guideline.list("-updated_date"),
    enabled: isAdmin,
  });

  const pendingGuidelines = guidelines.filter(g => {
    const s = g.review_status || "DRAFT";
    if (statusFilter === "ALL") return s !== "EXPERT_REVIEWED";
    return s === statusFilter;
  });

  const handleAction = async (guideline, action, note) => {
    const entry = {
      action,
      by: user.full_name || user.email,
      timestamp: new Date().toISOString(),
      note: note || null,
    };
    const newStatus = action === "approved" ? "EXPERT_REVIEWED" : action === "rejected" ? "DRAFT" : "PENDING_REVIEW";
    try {
      await base44.entities.Guideline.update(guideline.id, {
        review_status: newStatus,
        reviewed_by: action === "approved" ? (user.full_name || user.email) : guideline.reviewed_by,
        last_expert_update: new Date().toISOString().split("T")[0],
        audit_trail: [...(guideline.audit_trail || []), entry],
      });
      queryClient.invalidateQueries({ queryKey: ["guidelines_pending"] });
      queryClient.invalidateQueries({ queryKey: ["guidelines"] });
      toast.success(`Guideline ${action === "approved" ? "approved" : "sent for revision"}`);
    } catch {
      toast.error("Failed to update review status");
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-500">
        <ShieldCheck className="w-4 h-4 text-slate-400" />
        Admin access required to view governance queue.
      </div>
    );
  }

  const counts = {
    total: pendingGuidelines.length,
    ai: guidelines.filter(g => g.review_status === "AI_GENERATED" || g.review_status === "AI_SUGGESTION").length,
    pending: guidelines.filter(g => g.review_status === "PENDING_REVIEW").length,
    approved: guidelines.filter(g => g.review_status === "EXPERT_REVIEWED").length,
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span className="text-sm font-bold text-slate-800">Governance Queue</span>
          {counts.total > 0 && (
            <Badge className="text-xs bg-amber-500 text-white border-0">{counts.total} pending</Badge>
          )}
        </div>
        <Button size="sm" variant="outline" className="text-xs" onClick={() => refetch()}>
          <RefreshCw className="w-3.5 h-3.5 mr-1" />Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "AI Pending", value: counts.ai, color: "bg-amber-50 border-amber-200 text-amber-800" },
          { label: "In Review", value: counts.pending, color: "bg-blue-50 border-blue-200 text-blue-800" },
          { label: "Approved", value: counts.approved, color: "bg-green-50 border-green-200 text-green-800" },
        ].map(s => (
          <div key={s.label} className={`border rounded-xl p-2.5 text-center ${s.color}`}>
            <p className="text-lg font-bold">{s.value}</p>
            <p className="text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {STATUS_FILTER_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
              statusFilter === opt.value ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Queue */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        </div>
      ) : pendingGuidelines.length === 0 ? (
        <div className="text-center py-8 text-sm text-slate-400">
          <CheckCircle className="w-8 h-8 text-green-300 mx-auto mb-2" />
          No items pending review.
        </div>
      ) : (
        <div className="space-y-2">
          {pendingGuidelines.map(g => (
            <QueueItem key={g.id} guideline={g} user={user} onAction={handleAction} />
          ))}
        </div>
      )}
    </div>
  );
}