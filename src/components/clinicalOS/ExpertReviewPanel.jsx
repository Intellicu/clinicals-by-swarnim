/**
 * EXPERT REVIEW + ADMIN GOVERNANCE PANEL
 * Allows admin users to review, approve, reject, and annotate guideline content
 * Shows review queue, audit trail, and version history
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck, ClipboardList, CheckCircle, XCircle, Clock, Edit, History,
  ChevronDown, ChevronUp, AlertTriangle, User, Calendar, Bot, Lock
} from "lucide-react";
import { REVIEW_STATUS } from "@/lib/clinicalOS/EvidenceGovernance";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

function ReviewStatusBadge({ status }) {
  const cfg = REVIEW_STATUS[status] || REVIEW_STATUS.DRAFT;
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${cfg.color}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function AuditEntry({ entry }) {
  return (
    <div className="flex items-start gap-2.5 py-2 border-b border-slate-100 last:border-0">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
        entry.action === "approved" ? "bg-green-100 text-green-700" :
        entry.action === "rejected" ? "bg-red-100 text-red-700" :
        entry.action === "edited" ? "bg-blue-100 text-blue-700" :
        "bg-slate-100 text-slate-600"
      }`}>
        {entry.action === "approved" ? "✓" : entry.action === "rejected" ? "✗" : entry.action === "edited" ? "✎" : "•"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-800">{entry.action.charAt(0).toUpperCase() + entry.action.slice(1)}</p>
        <p className="text-xs text-slate-500">{entry.by} · {new Date(entry.timestamp).toLocaleDateString()}</p>
        {entry.note && <p className="text-xs text-slate-600 italic mt-0.5">"{entry.note}"</p>}
      </div>
    </div>
  );
}

/**
 * Expert Review Panel — Admin-only governance widget
 * @param {object} props
 * @param {object} props.entity - the guideline/pathway entity record
 * @param {string} props.entityType - "guideline" | "pathway" | "template"
 * @param {object} props.user - current user
 * @param {function} props.onSave - callback with updated review metadata
 */
export default function ExpertReviewPanel({ entity, entityType = "guideline", user, onSave }) {
  const [expanded, setExpanded] = useState(false);
  const [reviewNote, setReviewNote] = useState("");
  const [saving, setSaving] = useState(false);

  const isAdmin = user?.role === "admin";
  const reviewStatus = entity?.review_status || "DRAFT";
  const auditTrail = entity?.audit_trail || [];
  const reviewedBy = entity?.reviewed_by;
  const lastExpertUpdate = entity?.last_expert_update;

  const handleAction = async (action) => {
    if (!isAdmin) { toast.error("Admin access required"); return; }
    setSaving(true);
    try {
      const entry = {
        action,
        by: user.full_name || user.email,
        timestamp: new Date().toISOString(),
        note: reviewNote || null,
      };
      const newStatus = action === "approved" ? "EXPERT_REVIEWED" : action === "rejected" ? "DRAFT" : "PENDING_REVIEW";
      const updated = {
        review_status: newStatus,
        reviewed_by: action === "approved" ? (user.full_name || user.email) : entity?.reviewed_by,
        last_expert_update: new Date().toISOString().split("T")[0],
        audit_trail: [...auditTrail, entry],
      };
      if (onSave) await onSave(updated);
      toast.success(`Content ${action === "approved" ? "approved" : "sent back for revision"}`);
      setReviewNote("");
    } catch (e) {
      toast.error("Failed to save review");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`border-2 rounded-xl overflow-hidden ${isAdmin ? "border-indigo-200" : "border-slate-200"}`}>
      <button
        className={`w-full flex items-center gap-2 px-3 py-2.5 text-left transition-colors ${isAdmin ? "bg-indigo-50 hover:bg-indigo-100" : "bg-slate-50"}`}
        onClick={() => setExpanded(!expanded)}
      >
        <ShieldCheck className={`w-4 h-4 flex-shrink-0 ${isAdmin ? "text-indigo-600" : "text-slate-400"}`} />
        <span className={`text-xs font-bold flex-1 ${isAdmin ? "text-indigo-800" : "text-slate-600"}`}>
          {isAdmin ? "Expert Review Governance" : "Review Status"}
        </span>
        <ReviewStatusBadge status={reviewStatus} />
        {expanded ? <ChevronUp className="w-3.5 h-3.5 opacity-50" /> : <ChevronDown className="w-3.5 h-3.5 opacity-50" />}
      </button>

      {expanded && (
        <div className="p-3 space-y-3 bg-white border-t border-slate-100">
          {/* Status info */}
          <div className="flex flex-wrap gap-2">
            {reviewedBy && (
              <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                <User className="w-3 h-3 text-slate-400" />
                Reviewed by: <strong>{reviewedBy}</strong>
              </div>
            )}
            {lastExpertUpdate && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                Updated: {lastExpertUpdate}
              </div>
            )}
          </div>

          {/* AI governance notice */}
          {(reviewStatus === "AI_GENERATED" || reviewStatus === "AI_SUGGESTION") && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
              <Bot className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-800">AI-Generated Content</p>
                <p className="text-xs text-amber-700 leading-relaxed mt-0.5">
                  Expert-written references, classifications, and tables are preserved. AI additions must be reviewed before clinical use.
                </p>
              </div>
            </div>
          )}

          {/* Admin actions */}
          {isAdmin && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-indigo-700 uppercase tracking-wide">Admin Review Actions</p>
              <textarea
                value={reviewNote}
                onChange={e => setReviewNote(e.target.value)}
                placeholder="Add review note (optional)..."
                className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                rows={2}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-xs"
                  onClick={() => handleAction("approved")}
                  disabled={saving}
                >
                  <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50 text-xs"
                  onClick={() => handleAction("rejected")}
                  disabled={saving}
                >
                  <XCircle className="w-3.5 h-3.5 mr-1" /> Request Revision
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-amber-300 text-amber-600 hover:bg-amber-50 text-xs"
                  onClick={() => handleAction("flagged_for_review")}
                  disabled={saving}
                >
                  <Clock className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* Audit trail */}
          {auditTrail.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                <History className="w-3 h-3" /> Audit Trail ({auditTrail.length})
              </p>
              <div className="max-h-40 overflow-y-auto">
                {auditTrail.slice().reverse().map((entry, i) => (
                  <AuditEntry key={i} entry={entry} />
                ))}
              </div>
            </div>
          )}

          {!isAdmin && reviewStatus === "PENDING_REVIEW" && (
            <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-2">
              <Lock className="w-3 h-3 flex-shrink-0" />
              This content is pending expert review. Consult primary guidelines until approved.
            </div>
          )}
        </div>
      )}
    </div>
  );
}