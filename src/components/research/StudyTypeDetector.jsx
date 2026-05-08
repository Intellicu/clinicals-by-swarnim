import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { Sparkles, Loader2, ChevronDown, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { classifyStudyType, STUDY_TYPES } from "@/lib/AdaptiveMethodologyEngine";

export default function StudyTypeDetector({ title, currentStudyType, onDetected, onSelectType, compact = false }) {
  const [result, setResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);

  // Auto-classify whenever title changes
  useEffect(() => {
    if (title && title.length > 10) {
      const classified = classifyStudyType(title);
      setResult(classified);
      if (classified && classified.confidence === "high" && onDetected) {
        onDetected(classified.detected);
      }
    } else {
      setResult(null);
    }
  }, [title]);

  const runAiClassification = async () => {
    if (!title) return;
    setAiLoading(true);
    try {
      const prompt = `You are a clinical research methodology expert specializing in pediatric nephrology.

Study Title: "${title}"

Classify this study into ONE of the following types:
- descriptive (clinicopathological profile, single-center experience, spectrum/features)
- crossSectional (prevalence, epidemiology, snapshot surveys)
- retrospective (chart review, historical cohort, records-based)
- prospectiveCohort (follow-up, incidence, longitudinal)
- rct (randomized, controlled trial, intervention comparison)
- caseControl (risk factors, case-control design)
- diagnostic (sensitivity, specificity, test accuracy, biomarker)
- prognostic (prediction, risk model, survival, prognostic factors)
- qualitative (experience, perception, thematic, interview)
- systematicReview (systematic review, meta-analysis, pooled)
- registry (database study, registry analysis, real-world data)

Reply with a JSON object ONLY:
{
  "type": "<one of the keys above>",
  "confidence": "high/medium/low",
  "reasoning": "<1-2 sentence explanation>",
  "framework": "<appropriate PICO/PECO/PEO/PIRO/SPIDER>",
  "reporting_guideline": "<STROBE/CONSORT/PRISMA/STARD/TRIPOD/COREQ>",
  "suggested_title_refinement": "<improved academic title if needed>"
}`;
      const raw = await base44.integrations.Core.InvokeLLM({ prompt, response_json_schema: {
        type: "object",
        properties: {
          type: { type: "string" },
          confidence: { type: "string" },
          reasoning: { type: "string" },
          framework: { type: "string" },
          reporting_guideline: { type: "string" },
          suggested_title_refinement: { type: "string" },
        }
      }});
      setAiSuggestion(raw);
      if (raw.type && STUDY_TYPES[raw.type] && onDetected) {
        onDetected(STUDY_TYPES[raw.type]);
      }
    } catch {
      // fallback to rule-based
    } finally {
      setAiLoading(false);
    }
  };

  const detected = aiSuggestion ? STUDY_TYPES[aiSuggestion.type] : result?.detected;
  const confidence = aiSuggestion ? aiSuggestion.confidence : result?.confidence;

  if (!title || title.length < 5) return null;

  if (compact && detected) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <Badge className={detected.color}>{detected.shortLabel}</Badge>
        <Badge variant="outline" className="text-xs">Framework: {detected.framework}</Badge>
        <Badge variant="outline" className="text-xs">→ {detected.reporting}</Badge>
        {confidence && (
          <Badge variant="outline" className={`text-xs ${confidence === "high" ? "text-green-600" : confidence === "medium" ? "text-amber-600" : "text-slate-500"}`}>
            {confidence} confidence
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {detected && (
        <Card className={`border-2 ${detected.border}`}>
          <CardContent className="p-3">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  <span className="text-sm font-semibold text-slate-800">Detected:</span>
                  <Badge className={detected.color}>{detected.label}</Badge>
                  <Badge variant="outline" className="text-xs">Framework: {detected.framework}</Badge>
                  <Badge variant="outline" className="text-xs border-green-300 text-green-700">→ {detected.reporting}</Badge>
                  {confidence && (
                    <Badge variant="outline" className={`text-xs ${confidence === "high" ? "text-green-600" : confidence === "medium" ? "text-amber-600" : "text-slate-500"}`}>
                      {confidence} confidence
                    </Badge>
                  )}
                </div>

                {aiSuggestion?.reasoning && (
                  <p className="text-xs text-slate-600 italic pl-6">{aiSuggestion.reasoning}</p>
                )}

                {aiSuggestion?.suggested_title_refinement && aiSuggestion.suggested_title_refinement !== title && (
                  <div className="pl-6">
                    <p className="text-xs text-indigo-700 font-medium">💡 Suggested title: <span className="font-normal italic">{aiSuggestion.suggested_title_refinement}</span></p>
                  </div>
                )}

                <div className="pl-6 flex flex-wrap gap-1">
                  <span className="text-xs text-slate-500 font-medium">Adaptive stats:</span>
                  {detected.stats.slice(0, 4).map(s => (
                    <Badge key={s} variant="outline" className="text-xs bg-slate-50">{s}</Badge>
                  ))}
                  {detected.stats.length > 4 && <span className="text-xs text-slate-400">+{detected.stats.length - 4} more</span>}
                </div>

                <div className="pl-6 flex items-center gap-1 flex-wrap">
                  <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                  <span className="text-xs text-slate-500 font-medium">Key biases to address:</span>
                  {detected.bias_risks.slice(0, 2).map(b => (
                    <Badge key={b} variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">{b}</Badge>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1 shrink-0">
                {onSelectType && (
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-xs h-7"
                    onClick={() => onSelectType(detected.id)}>
                    Apply Design
                  </Button>
                )}
                <Button size="sm" variant="outline" className="text-xs h-7 gap-1" onClick={runAiClassification} disabled={aiLoading}>
                  {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  AI Verify
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!detected && (
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500">Study type not auto-detected. Use AI classification below.</span>
          <Button size="sm" variant="outline" className="text-xs h-7 gap-1 ml-auto" onClick={runAiClassification} disabled={aiLoading}>
            {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            Classify with AI
          </Button>
        </div>
      )}

      {/* Alternatives */}
      {result?.alternatives?.length > 0 && (
        <div>
          <button className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1" onClick={() => setShowAll(!showAll)}>
            <ChevronDown className={`w-3 h-3 transition-transform ${showAll ? "rotate-180" : ""}`} />
            {showAll ? "Hide" : "Show"} alternative designs ({result.alternatives.length})
          </button>
          {showAll && (
            <div className="flex flex-wrap gap-2 mt-2">
              {result.alternatives.map(alt => (
                <button key={alt.id} onClick={() => onSelectType?.(alt.id)}
                  className={`text-xs px-2 py-1 rounded-full border-2 ${alt.border} ${alt.color} hover:opacity-80 transition-opacity`}>
                  {alt.shortLabel}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Manual pick */}
      {onSelectType && (
        <div>
          <button className="text-xs text-indigo-600 hover:underline" onClick={() => setShowAll(s => !s)}>
            {showAll ? "← Hide" : "Choose manually from all types →"}
          </button>
          {showAll && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {Object.values(STUDY_TYPES).map(t => (
                <button key={t.id} onClick={() => { onSelectType(t.id); setShowAll(false); }}
                  className={`text-xs px-2.5 py-1 rounded-full border-2 ${t.border} ${t.color} hover:opacity-80 transition-opacity ${currentStudyType === t.id ? "ring-2 ring-offset-1 ring-indigo-500" : ""}`}>
                  {t.shortLabel}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}