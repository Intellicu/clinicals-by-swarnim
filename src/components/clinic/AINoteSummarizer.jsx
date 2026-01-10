import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, CheckCircle, FileText } from "lucide-react";
import { toast } from "sonner";

export default function AINoteSummarizer({ visitId, clinicalNotes, onSummaryGenerated }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const generateSummary = async () => {
    setLoading(true);
    try {
      toast.info("Generating AI summary...", { id: "ai-summary" });
      
      const prompt = `Summarize this clinical note concisely for medical staff handover. Extract and highlight:

DIAGNOSIS: Primary and differential diagnoses
CHIEF COMPLAINT: Main presenting problems
KEY FINDINGS: Critical physical exam and lab findings
TREATMENT PLAN: Medications, procedures, interventions
NEXT STEPS: Follow-up actions, pending tests, monitoring needed
RED FLAGS: Any concerning findings requiring urgent attention

Clinical Note:
${clinicalNotes}

Return structured summary.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            diagnosis: { type: "string" },
            chief_complaint: { type: "string" },
            key_findings: { type: "array", items: { type: "string" } },
            treatment_plan: { type: "string" },
            next_steps: { type: "array", items: { type: "string" } },
            red_flags: { type: "array", items: { type: "string" } }
          }
        }
      });

      setSummary(response);
      
      // Save summary to visit record
      if (visitId) {
        await base44.entities.VisitRecord.update(visitId, {
          ai_summary: response
        });
        queryClient.invalidateQueries({ queryKey: ['visits'] });
      }
      
      onSummaryGenerated?.(response);
      toast.success("Summary generated!", { id: "ai-summary" });
    } catch (error) {
      toast.error("Summary generation failed", { id: "ai-summary" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-green-600" />
            AI Clinical Summary
          </CardTitle>
          <Button
            onClick={generateSummary}
            disabled={loading || !clinicalNotes}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Summary
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {!summary ? (
          <div className="text-center py-8 text-slate-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm">Click the button above to generate an AI-powered summary of clinical notes</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
              <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Diagnosis
              </h4>
              <p className="text-sm text-blue-800">{summary.diagnosis}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Chief Complaint</h4>
              <p className="text-sm text-slate-700">{summary.chief_complaint}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Key Findings</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                {summary.key_findings?.map((finding, idx) => (
                  <li key={idx}>{finding}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Treatment Plan</h4>
              <p className="text-sm text-slate-700">{summary.treatment_plan}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Next Steps</h4>
              <ul className="space-y-1">
                {summary.next_steps?.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Badge className="bg-purple-100 text-purple-800 text-xs mt-0.5">
                      {idx + 1}
                    </Badge>
                    <span className="text-slate-700">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {summary.red_flags?.length > 0 && (
              <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded">
                <h4 className="font-bold text-red-900 mb-2">Red Flags ⚠️</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-red-800">
                  {summary.red_flags.map((flag, idx) => (
                    <li key={idx}>{flag}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}