import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  Target,
  Lightbulb,
  Brain,
  Loader2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  FileText,
  ArrowRight,
  Video
} from "lucide-react";
import { toast } from "sonner";

export default function GuidelineSummaryCard({ guideline, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const summarizeMutation = useMutation({
    mutationFn: async () => {
      const prompt = `You are a pediatric nephrologist creating a CLINICAL QUICK REFERENCE from this guideline.

GUIDELINE: ${guideline.title}
SOURCE: ${guideline.source} (${guideline.year})
CATEGORY: ${guideline.category}
FULL CONTENT: ${guideline.summary}
${guideline.content ? JSON.stringify(guideline.content) : ''}

Create a structured clinical reference with NO REPETITION:

1. CLINICAL SUMMARY (2-3 clear, concise sentences):
   - WHO: Exact patient population (age range, specific condition)
   - WHEN: Specific clinical scenarios/presentations
   - WHAT: Main clinical approach or intervention
   Example: "For children 1-18 years with biopsy-proven IgA nephropathy presenting with proteinuria. Applies to both acute presentations and chronic management. Uses risk stratification to guide immunosuppression decisions."

2. KEY MANAGEMENT STEPS (6-10 actionable steps in algorithm sequence):
   - Present as STEP-BY-STEP clinical algorithm
   - Each step must be SPECIFIC and ACTIONABLE (not general principles)
   - Include decision criteria, thresholds, or timing
   - Order by clinical workflow
   Example format:
   "1. Obtain 24-hour urine protein OR spot UPCR within 48 hours of presentation"
   "2. Stage disease severity: Mild (<1g/day), Moderate (1-3g/day), Severe (>3g/day)"
   "3. If proteinuria >1g/day AND eGFR >60: Start ACE-I at 0.1 mg/kg/day"

3. PRACTICE PEARLS (4-6 bedside tips):
   - Practical, implementation-focused tips
   - Include common pitfalls to AVOID
   - Shortcuts or clinical tricks
   - Drug-specific dosing tips if relevant
   Example: "Start ACE-I low and titrate slowly to avoid hyperkalemia in CKD patients"

4. EVIDENCE LEVEL:
   - State overall quality clearly
   - Mention 1-2 key supporting studies if landmark trials exist

BE SPECIFIC. AVOID VAGUE STATEMENTS. NO REPETITION ACROSS SECTIONS.`;

      const summary = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            scope_and_population: { type: "string" },
            key_recommendations: { 
              type: "array", 
              items: { type: "string" },
              description: "6-10 specific, sequential management steps"
            },
            practice_pearls: { 
              type: "array", 
              items: { type: "string" },
              description: "4-6 bedside implementation tips"
            },
            evidence_quality: { type: "string" },
            population: { 
              type: "array", 
              items: { type: "string" }
            },
            clinical_scope: { 
              type: "array", 
              items: { type: "string" }
            }
          }
        }
      });

      await base44.entities.Guideline.update(guideline.id, {
        scope_and_population: summary.scope_and_population,
        key_recommendations: summary.key_recommendations,
        practice_pearls: summary.practice_pearls,
        population: summary.population,
        clinical_scope: summary.clinical_scope
      });

      if (onUpdate) onUpdate();
      return summary;
    },
    onSuccess: () => {
      setIsSummarizing(false);
      toast.success("AI summary generated!");
    }
  });

  const handleSummarize = () => {
    setIsSummarizing(true);
    summarizeMutation.mutate();
  };

  const hasEnhancedSummary = guideline.scope_and_population && guideline.key_recommendations?.length > 0;

  return (
    <Link to={createPageUrl("GuidelineDetail") + `?id=${guideline.id}`}>
      <Card className="h-full bg-white border-2 border-slate-200 hover:border-blue-400 hover:shadow-2xl transition-all duration-300 overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-bl-full transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-500" />
        
        <CardHeader className="pb-4 space-y-4 relative">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`${
                  guideline.source.includes("KDIGO") ? "bg-blue-600" :
                  guideline.source.includes("IAP") ? "bg-green-600" :
                  guideline.source.includes("IPNA") ? "bg-purple-600" :
                  guideline.source.includes("ISPD") ? "bg-cyan-600" :
                  "bg-slate-600"
                } text-white font-semibold px-3 py-1.5 shadow-sm`}>
                  {guideline.source}
                </Badge>
                <Badge variant="outline" className="font-semibold border-2 px-3 py-1.5">
                  {guideline.year}
                </Badge>
                {guideline.evidence_level && (
                  <Badge className={`${
                    guideline.evidence_level.includes("High") ? "bg-green-500" :
                    guideline.evidence_level.includes("Moderate") ? "bg-amber-500" :
                    "bg-slate-500"
                  } text-white font-medium`}>
                    <Award className="w-3 h-3 mr-1" />
                    {guideline.evidence_level.split(' ')[0]}
                  </Badge>
                )}
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 leading-tight group-hover:text-blue-700 transition-colors">
                {guideline.title}
              </h3>
            </div>

            {!hasEnhancedSummary && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  handleSummarize();
                }}
                disabled={isSummarizing}
                className="border-purple-300 hover:bg-purple-50 flex-shrink-0"
              >
                {isSummarizing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">AI</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pb-6">
          {hasEnhancedSummary && guideline.scope_and_population ? (
            <>
              {/* Summary Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border-2 border-blue-200">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-blue-900 text-sm mb-1">Clinical Summary</h4>
                    <p className="text-sm text-blue-800 leading-relaxed">
                      {guideline.scope_and_population}
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Steps Preview */}
              {guideline.key_recommendations && guideline.key_recommendations.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-5 h-5 text-green-600" />
                    <h4 className="font-bold text-slate-900">Management Algorithm</h4>
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      {guideline.key_recommendations.length} Steps
                    </Badge>
                  </div>
                  
                  <div className="space-y-2.5">
                    {guideline.key_recommendations.slice(0, expanded ? undefined : 3).map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-3 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-200 hover:border-green-400 transition-all group/step">
                        <div className="w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold shadow-sm">
                          {idx + 1}
                        </div>
                        <span className="text-sm text-green-900 flex-1 leading-relaxed font-medium">{rec}</span>
                        <ArrowRight className="w-4 h-4 text-green-600 opacity-0 group-hover/step:opacity-100 transition-opacity flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                  
                  {guideline.key_recommendations.length > 3 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        setExpanded(!expanded);
                      }}
                      className="w-full mt-3 text-green-700 hover:text-green-900 hover:bg-green-50"
                    >
                      {expanded ? (
                        <>
                          <ChevronUp className="w-4 h-4 mr-2" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 mr-2" />
                          Show {guideline.key_recommendations.length - 3} More Steps
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}

              {/* Practice Pearls */}
              {guideline.practice_pearls && guideline.practice_pearls.length > 0 && expanded && (
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-5 rounded-xl border-2 border-amber-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-5 h-5 text-amber-600" />
                    <h4 className="font-bold text-amber-900">Clinical Pearls</h4>
                  </div>
                  <div className="space-y-2.5">
                    {guideline.practice_pearls.map((pearl, idx) => (
                      <div key={idx} className="flex items-start gap-3 bg-white/80 p-3 rounded-lg">
                        <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-amber-900 leading-relaxed">{pearl}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Multimedia Section */}
              {guideline.multimedia && expanded && (guideline.multimedia.video_overview_url || guideline.multimedia.slides_url || guideline.multimedia.infographics?.length > 0) && (
                <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
                  <div className="text-xs font-semibold text-purple-900 mb-2">Multimedia Resources:</div>
                  <div className="flex flex-wrap gap-2">
                    {guideline.multimedia.video_overview_url && (
                      <Badge className="bg-pink-500 text-white">
                        <Video className="w-3 h-3 mr-1" />
                        Video
                      </Badge>
                    )}
                    {guideline.multimedia.slides_url && (
                      <Badge className="bg-blue-500 text-white">
                        Slides
                      </Badge>
                    )}
                    {guideline.multimedia.infographics?.length > 0 && (
                      <Badge className="bg-green-500 text-white">
                        {guideline.multimedia.infographics.length} Images
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-4 border-t-2 border-slate-100">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 shadow-lg hover:shadow-xl transition-all group/btn">
                  <FileText className="w-5 h-5 mr-2" />
                  View Complete Guideline
                  <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-600 leading-relaxed line-clamp-4">
                {guideline.summary}
              </p>
              
              <div className="pt-4 border-t border-slate-200">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 shadow-lg hover:shadow-xl transition-all">
                  <FileText className="w-4 h-4 mr-2" />
                  View Guideline Details
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}