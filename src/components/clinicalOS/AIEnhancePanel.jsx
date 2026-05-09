/**
 * AI ENHANCE PANEL — EVIDENCE-AWARE UPGRADE
 * Before/after review, change highlighting, evidence confidence,
 * preserve references/tables, detect outdated recommendations
 */
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles, Eye, EyeOff, CheckCircle, XCircle, AlertTriangle,
  Shield, FileText, Loader2, ChevronDown, ChevronUp,
  BarChart3, Lock, Bot, BookOpen
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const CONFIDENCE_COLORS = {
  HIGH: "bg-green-100 text-green-800 border-green-300",
  MEDIUM: "bg-amber-100 text-amber-800 border-amber-300",
  LOW: "bg-red-100 text-red-800 border-red-300",
};

function ChangeDiff({ before, after, label, type = "text" }) {
  const changed = before !== after;
  return (
    <div className={`border rounded-lg overflow-hidden ${changed ? "border-amber-300" : "border-slate-200"}`}>
      <div className={`px-2.5 py-1.5 text-xs font-bold flex items-center justify-between ${changed ? "bg-amber-50 text-amber-800" : "bg-slate-50 text-slate-600"}`}>
        <span>{label}</span>
        {changed ? (
          <Badge className="text-xs bg-amber-500 text-white border-0 py-0">Changed</Badge>
        ) : (
          <Badge className="text-xs bg-green-100 text-green-700 border-green-200 py-0">Unchanged</Badge>
        )}
      </div>
      {changed ? (
        <div className="p-2.5 space-y-2">
          <div className="bg-red-50 border border-red-200 rounded p-2">
            <p className="text-xs text-red-400 font-bold mb-0.5">Before</p>
            <p className="text-xs text-red-800 leading-relaxed line-through opacity-75">{before || "(empty)"}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded p-2">
            <p className="text-xs text-green-600 font-bold mb-0.5">After (AI suggestion)</p>
            <p className="text-xs text-green-800 leading-relaxed">{after}</p>
          </div>
        </div>
      ) : (
        <div className="p-2.5">
          <p className="text-xs text-slate-600 leading-relaxed">{before || "(empty)"}</p>
        </div>
      )}
    </div>
  );
}

function ConfidenceIndicator({ score, label }) {
  const level = score >= 0.8 ? "HIGH" : score >= 0.5 ? "MEDIUM" : "LOW";
  const pct = Math.round(score * 100);
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500 flex-1">{label}</span>
      <div className="flex items-center gap-1.5">
        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${level === "HIGH" ? "bg-green-500" : level === "MEDIUM" ? "bg-amber-400" : "bg-red-400"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className={`text-xs px-1.5 py-0.5 rounded border font-bold ${CONFIDENCE_COLORS[level]}`}>{pct}%</span>
      </div>
    </div>
  );
}

export default function AIEnhancePanel({ guideline, isAdmin = false, onApprove, onReject }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showDiffs, setShowDiffs] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const handleEnhance = async () => {
    if (!guideline) return;
    setLoading(true);
    try {
      const prompt = `You are a senior pediatric nephrologist reviewing a clinical guideline for accuracy and completeness.

Guideline to review:
- Title: ${guideline.title}
- Source: ${guideline.source} (${guideline.year})
- Category: ${guideline.category}
- Current summary: ${guideline.scope_and_population || guideline.summary || "Not provided"}
- Current key steps (${guideline.key_recommendations?.length || 0}): ${guideline.key_recommendations?.slice(0, 3).join("; ") || "None"}
- Current practice pearls (${guideline.practice_pearls?.length || 0}): ${guideline.practice_pearls?.slice(0, 2).join("; ") || "None"}
- Current evidence level: ${guideline.evidence_level || "Not stated"}

Tasks:
1. Suggest an improved clinical summary (concise, evidence-sourced, ≤3 sentences)
2. Identify any outdated recommendations (list specific issues)
3. Suggest 2–3 missing monitoring recommendations
4. Suggest 2–3 newer citations (format: Author et al., Journal, Year, PMID if known)
5. Rate overall evidence confidence (0.0–1.0) with reasoning
6. Flag: does the current content correctly reflect the stated guideline source?

IMPORTANT: Preserve all existing references, tables, and expert-written classifications. Only suggest additions or corrections — do not remove content.

Return JSON only.`;

      const enhanced = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            improved_summary: { type: "string" },
            outdated_recommendations: { type: "array", items: { type: "string" } },
            missing_monitoring: { type: "array", items: { type: "string" } },
            newer_citations: { type: "array", items: { type: "string" } },
            evidence_confidence: { type: "number" },
            confidence_reasoning: { type: "string" },
            source_accuracy_flag: { type: "boolean" },
            source_accuracy_note: { type: "string" },
            suggested_evidence_level: { type: "string" },
          }
        }
      });

      setResult(enhanced);
      setExpanded(true);
    } catch (e) {
      toast.error("AI enhancement failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!result || !onApprove) return;
    await onApprove({
      scope_and_population: result.improved_summary || guideline.scope_and_population,
      evidence_level: result.suggested_evidence_level || guideline.evidence_level,
      review_status: "PENDING_REVIEW",
      ai_pending_sections: [
        ...(result.missing_monitoring?.length ? [{ type: "monitoring", items: result.missing_monitoring }] : []),
        ...(result.newer_citations?.length ? [{ type: "citations", items: result.newer_citations }] : []),
      ],
    });
    toast.success("AI suggestions saved. Awaiting expert review.");
    setResult(null);
  };

  const handleReject = () => {
    setResult(null);
    if (onReject) onReject();
    toast.info("AI suggestions discarded.");
  };

  return (
    <div className="border-2 border-purple-200 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        className="w-full flex items-center gap-2 px-3 py-2.5 text-left bg-purple-50 hover:bg-purple-100 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0" />
        <span className="text-xs font-bold text-purple-800 flex-1">Evidence-Aware AI Enhancement</span>
        {result && <Badge className="text-xs bg-amber-500 text-white border-0">Review Required</Badge>}
        {expanded ? <ChevronUp className="w-3.5 h-3.5 text-purple-400" /> : <ChevronDown className="w-3.5 h-3.5 text-purple-400" />}
      </button>

      {expanded && (
        <div className="p-3 space-y-3 bg-white border-t border-purple-100">
          {/* Info */}
          <div className="flex items-start gap-2 bg-purple-50 border border-purple-200 rounded-lg p-2.5">
            <Shield className="w-3.5 h-3.5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-purple-700 space-y-0.5">
              <p className="font-bold">Evidence-safe enhancement:</p>
              <ul className="list-disc pl-3 space-y-0.5">
                <li>Preserves existing references, tables, and expert-written classifications</li>
                <li>Detects outdated recommendations vs current guidelines</li>
                <li>Flags source accuracy issues</li>
                <li>All suggestions require admin approval before publishing</li>
              </ul>
            </div>
          </div>

          {/* Trigger */}
          {!result && (
            <Button
              className="w-full bg-purple-600 hover:bg-purple-700 text-sm"
              onClick={handleEnhance}
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analysing against guidelines…</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" />Run Evidence-Aware Enhancement</>
              )}
            </Button>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-3">
              {/* Confidence indicator */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                  <BarChart3 className="w-3 h-3" /> Evidence Confidence
                </p>
                <ConfidenceIndicator score={result.evidence_confidence || 0.5} label="Overall confidence score" />
                {result.confidence_reasoning && (
                  <p className="text-xs text-slate-500 italic leading-relaxed">{result.confidence_reasoning}</p>
                )}
                {result.source_accuracy_flag === false && (
                  <div className="flex items-start gap-1.5 bg-red-50 border border-red-200 rounded p-2 mt-1">
                    <AlertTriangle className="w-3 h-3 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700 font-medium">{result.source_accuracy_note || "Source accuracy concern detected."}</p>
                  </div>
                )}
              </div>

              {/* Before/after diffs */}
              {showDiffs && (
                <div className="space-y-2.5">
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                    <Eye className="w-3 h-3" /> Before / After Comparison
                  </p>
                  <ChangeDiff
                    label="Clinical Summary"
                    before={guideline.scope_and_population || guideline.summary}
                    after={result.improved_summary}
                  />
                  {result.suggested_evidence_level && (
                    <ChangeDiff
                      label="Evidence Level"
                      before={guideline.evidence_level}
                      after={result.suggested_evidence_level}
                    />
                  )}
                </div>
              )}

              {/* Outdated recommendations */}
              {result.outdated_recommendations?.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-xs font-bold text-amber-800 mb-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Potentially Outdated Recommendations
                  </p>
                  <ul className="space-y-1">
                    {result.outdated_recommendations.map((r, i) => (
                      <li key={i} className="text-xs text-amber-700 flex items-start gap-1.5">
                        <span className="text-amber-400 mt-0.5">•</span>{r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Missing monitoring */}
              {result.missing_monitoring?.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <p className="text-xs font-bold text-blue-800 mb-1.5 flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Suggested Monitoring Additions
                  </p>
                  <ul className="space-y-1">
                    {result.missing_monitoring.map((m, i) => (
                      <li key={i} className="text-xs text-blue-700 flex items-start gap-1.5">
                        <span className="text-blue-400 mt-0.5">+</span>{m}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Newer citations */}
              {result.newer_citations?.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                  <p className="text-xs font-bold text-green-800 mb-1.5 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> Suggested Newer Citations
                  </p>
                  <ul className="space-y-1">
                    {result.newer_citations.map((c, i) => (
                      <li key={i} className="text-xs text-green-700 font-mono leading-relaxed">{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Toggle diff view */}
              <button onClick={() => setShowDiffs(!showDiffs)}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700">
                {showDiffs ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {showDiffs ? "Hide" : "Show"} before/after comparison
              </button>

              {/* AI governance notice */}
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                <Bot className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  <strong>Expert review required.</strong> These are AI suggestions only. Expert-written references and classifications are preserved. Admin approval required before clinical publication.
                </p>
              </div>

              {/* Approve/reject (admin only) */}
              {isAdmin ? (
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-xs" onClick={handleApprove}>
                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> Save for Review
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 border-red-300 text-red-600 hover:bg-red-50 text-xs" onClick={handleReject}>
                    <XCircle className="w-3.5 h-3.5 mr-1" /> Discard
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-2">
                  <Lock className="w-3 h-3" /> Admin approval required to save AI suggestions.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}