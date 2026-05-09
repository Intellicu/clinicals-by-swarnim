/**
 * EVIDENCE AUTHORITY PANEL
 * Contextual evidence metadata panel for guidelines, pathways, and prescriptions
 * Shows primary guideline, supporting orgs, year, review status, and source attribution
 */
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, ChevronDown, ChevronUp, ExternalLink, Shield, GitCompare, Info, CheckCircle, Clock, Bot, AlertTriangle } from "lucide-react";
import { REVIEW_STATUS, GUIDELINE_HIERARCHY, PATHWAY_ATTRIBUTION } from "@/lib/clinicalOS/EvidenceGovernance";

function ReviewStatusBadge({ status = "DRAFT" }) {
  const cfg = REVIEW_STATUS[status] || REVIEW_STATUS.DRAFT;
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${cfg.color}`}>
      <span>{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

function OrgBadge({ org, year }) {
  const colors = {
    ISPN: "bg-blue-600", IPNA: "bg-indigo-600", KDIGO: "bg-cyan-700",
    AAP: "bg-green-600", ISKDC: "bg-slate-600", ESH: "bg-purple-600",
    ISPD: "bg-teal-600", ESPN: "bg-emerald-600", ERKNet: "bg-orange-600",
    KDOQI: "bg-sky-600", ADQI: "bg-violet-600", pRIFLE: "bg-rose-600",
    EULAR: "bg-red-700", ESCAPE: "bg-amber-700",
  };
  const bg = colors[org] || "bg-slate-600";
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded text-white font-bold ${bg}`}>
      {org} {year && <span className="opacity-80 font-normal">{year}</span>}
    </span>
  );
}

/**
 * Full evidence authority panel (for guideline detail pages)
 */
export function EvidenceAuthorityPanel({
  area,              // guideline hierarchy area key e.g. "nephrotic_syndrome"
  pathwayKey,        // pathway attribution key e.g. "nephrotic_relapse"
  reviewStatus,      // "EXPERT_REVIEWED" | "PENDING_REVIEW" | "AI_GENERATED" etc.
  reviewedBy,        // string — clinician name
  lastExpertUpdate,  // date string
  compact = false,
  onCompare,         // callback to open comparison view
}) {
  const [expanded, setExpanded] = useState(!compact);

  const hierarchy = area ? GUIDELINE_HIERARCHY[area] : null;
  const attribution = pathwayKey ? PATHWAY_ATTRIBUTION[pathwayKey] : null;

  if (!hierarchy && !attribution && !reviewStatus) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-blue-100/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <Award className="w-4 h-4 text-blue-600 flex-shrink-0" />
        <span className="text-xs font-bold text-blue-800 flex-1">Evidence Authority</span>
        {reviewStatus && <ReviewStatusBadge status={reviewStatus} />}
        {expanded ? <ChevronUp className="w-3.5 h-3.5 text-blue-500" /> : <ChevronDown className="w-3.5 h-3.5 text-blue-500" />}
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-2.5 border-t border-blue-200">
          {/* Primary guideline */}
          {hierarchy && (
            <div className="pt-2.5">
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1.5">Primary Operational Guideline</p>
              <div className="flex flex-wrap items-center gap-1.5">
                <OrgBadge org={hierarchy.primary.org} year={hierarchy.primary.year} />
                <span className="text-xs text-slate-700 leading-snug">{hierarchy.primary.full}</span>
              </div>
              {hierarchy.rationale && (
                <p className="text-xs text-slate-500 mt-1 leading-relaxed italic">{hierarchy.rationale}</p>
              )}
            </div>
          )}

          {/* Pathway attribution */}
          {attribution && (
            <div className="pt-1">
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1.5">Pathway Source</p>
              <div className="flex flex-wrap items-center gap-1.5">
                <OrgBadge org={attribution.primary_source.split(" ")[0]} year={attribution.year} />
                <span className="text-xs text-slate-700">{attribution.name}</span>
              </div>
              {attribution.doi && (
                <a href={attribution.doi} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1">
                  <ExternalLink className="w-2.5 h-2.5" />Source document
                </a>
              )}
            </div>
          )}

          {/* Supporting guidelines */}
          {hierarchy?.supporting?.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1">Supporting Guidelines</p>
              <div className="flex flex-wrap gap-1">
                {hierarchy.supporting.map((s, i) => (
                  <OrgBadge key={i} org={s.org} year={s.year} />
                ))}
              </div>
            </div>
          )}

          {/* Review metadata */}
          {(reviewedBy || lastExpertUpdate) && (
            <div className="bg-white/70 border border-blue-100 rounded-lg px-2.5 py-2">
              {reviewedBy && (
                <div className="flex items-center gap-1.5 text-xs text-slate-700">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Expert reviewed by: <strong>{reviewedBy}</strong></span>
                </div>
              )}
              {lastExpertUpdate && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                  <Clock className="w-3 h-3" />
                  <span>Last updated: {lastExpertUpdate}</span>
                </div>
              )}
            </div>
          )}

          {/* Compare button */}
          {onCompare && (
            <Button size="sm" variant="outline" className="w-full text-xs border-blue-300 text-blue-700 hover:bg-blue-100" onClick={onCompare}>
              <GitCompare className="w-3.5 h-3.5 mr-1.5" />Compare Definitions Across Guidelines
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Compact inline attribution badge (for pathway headers, prescription templates)
 */
export function InlineSourceBadge({ area, pathwayKey, compact = true }) {
  const hierarchy = area ? GUIDELINE_HIERARCHY[area] : null;
  const attribution = pathwayKey ? PATHWAY_ATTRIBUTION[pathwayKey] : null;
  const source = hierarchy?.primary || (attribution ? { org: attribution.primary_source.split(" ")[0], year: attribution.year } : null);
  if (!source) return null;
  return (
    <span className="inline-flex items-center gap-1.5">
      <Award className="w-3 h-3 text-blue-500" />
      <OrgBadge org={source.org} year={source.year} />
    </span>
  );
}

/**
 * AI governance notice for AI-generated content
 */
export function AIGovernanceNotice({ isPendingReview = true, onApprove, onReject, adminMode = false }) {
  return (
    <div className={`flex items-start gap-2 p-2.5 rounded-lg border text-xs ${isPendingReview ? "bg-amber-50 border-amber-200" : "bg-blue-50 border-blue-200"}`}>
      <Bot className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${isPendingReview ? "text-amber-600" : "text-blue-500"}`} />
      <div className="flex-1">
        <p className={`font-semibold ${isPendingReview ? "text-amber-800" : "text-blue-700"}`}>
          {isPendingReview ? "AI-Generated Content — Pending Expert Review" : "AI-Enhanced — Reviewed"}
        </p>
        <p className={`mt-0.5 leading-relaxed ${isPendingReview ? "text-amber-700" : "text-blue-600"}`}>
          Expert-written references, classifications, and tables are preserved. AI additions require approval before clinical use.
        </p>
        {adminMode && isPendingReview && (onApprove || onReject) && (
          <div className="flex gap-2 mt-1.5">
            {onApprove && (
              <button onClick={onApprove} className="px-2 py-1 bg-green-600 text-white rounded text-xs font-semibold hover:bg-green-700">
                ✓ Approve
              </button>
            )}
            {onReject && (
              <button onClick={onReject} className="px-2 py-1 bg-red-500 text-white rounded text-xs font-semibold hover:bg-red-600">
                ✗ Reject
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export { OrgBadge, ReviewStatusBadge };
export default EvidenceAuthorityPanel;