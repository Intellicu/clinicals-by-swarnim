import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Brain, AlertTriangle, TrendingUp, Pill, Users, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function AITreatmentSuggestions({ patient }) {
  const [suggestions, setSuggestions] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: visits = [] } = useQuery({
    queryKey: ['patient-visits', patient.id],
    queryFn: () => base44.entities.VisitRecord.filter({ patient_id: patient.id }, '-visit_date'),
    enabled: !!patient
  });

  const analyzeTreatment = async () => {
    setIsAnalyzing(true);
    toast.info("AI analyzing patient data...", { id: "ai-analysis", duration: Infinity });

    try {
      const patientContext = `
Patient: ${patient.patient_name}, Age: ${patient.age_years}y, Gender: ${patient.gender}
Diagnosis: ${patient.diagnosis}
Current Medications: ${patient.current_medications?.join(", ") || "None"}
Comorbidities: ${patient.comorbidities?.join(", ") || "None"}
Allergies: ${patient.allergies?.join(", ") || "None"}
Recent Visits: ${visits.slice(0, 3).map(v => `${v.visit_date}: ${v.chief_complaint}`).join("; ")}
`;

      const prompt = `You are a pediatric nephrology AI assistant. Analyze this patient and provide:

${patientContext}

ANALYSIS REQUIRED:
1. Personalized Treatment Recommendations (based on diagnosis, age, current meds)
2. Drug Interaction Warnings (check all current medications)
3. Early Intervention Opportunities (CKD/AKI progression risk, specialist referrals)
4. Monitoring Recommendations
5. Red Flags (urgent concerns to address)

Use KDIGO 2024, IPNA, and ISPN guidelines.

Return as JSON:
{
  "treatment_recommendations": ["..."],
  "drug_interactions": [{"severity": "major|moderate|minor", "interaction": "...", "action": "..."}],
  "early_interventions": [{"type": "referral|monitoring|treatment", "reason": "...", "urgency": "high|medium|low"}],
  "monitoring_plan": ["..."],
  "red_flags": ["..."]
}`;

      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            treatment_recommendations: { type: "array", items: { type: "string" } },
            drug_interactions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  severity: { type: "string" },
                  interaction: { type: "string" },
                  action: { type: "string" }
                }
              }
            },
            early_interventions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  reason: { type: "string" },
                  urgency: { type: "string" }
                }
              }
            },
            monitoring_plan: { type: "array", items: { type: "string" } },
            red_flags: { type: "array", items: { type: "string" } }
          }
        }
      });

      setSuggestions(analysis);
      toast.success("Analysis complete!", { id: "ai-analysis" });
    } catch (error) {
      console.error("AI analysis error:", error);
      toast.error("Analysis failed", { id: "ai-analysis" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="shadow-lg border-2 border-purple-200">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            AI Treatment Insights
          </CardTitle>
          <Button onClick={analyzeTreatment} disabled={isAnalyzing} size="sm" className="bg-purple-600 hover:bg-purple-700">
            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            Analyze
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {!suggestions ? (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="text-sm text-blue-900">
              Click "Analyze" to get AI-powered treatment suggestions, drug interaction warnings, and early intervention recommendations.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {suggestions.red_flags && suggestions.red_flags.length > 0 && (
              <Alert className="bg-red-50 border-red-300">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <AlertDescription>
                  <strong className="text-red-900">Red Flags:</strong>
                  <ul className="mt-2 space-y-1">
                    {suggestions.red_flags.map((flag, idx) => (
                      <li key={idx} className="text-sm text-red-800">⚠️ {flag}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {suggestions.drug_interactions && suggestions.drug_interactions.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <Pill className="w-4 h-4" />
                  Drug Interactions
                </h4>
                <div className="space-y-2">
                  {suggestions.drug_interactions.map((interaction, idx) => (
                    <Alert key={idx} className={
                      interaction.severity === 'major' ? 'bg-red-50 border-red-200' :
                      interaction.severity === 'moderate' ? 'bg-amber-50 border-amber-200' :
                      'bg-blue-50 border-blue-200'
                    }>
                      <AlertDescription className="text-sm">
                        <Badge className={
                          interaction.severity === 'major' ? 'bg-red-600' :
                          interaction.severity === 'moderate' ? 'bg-amber-600' :
                          'bg-blue-600'
                        }>
                          {interaction.severity}
                        </Badge>
                        <p className="mt-1 font-semibold">{interaction.interaction}</p>
                        <p className="mt-1 text-xs">{interaction.action}</p>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}

            {suggestions.treatment_recommendations && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Treatment Recommendations</h4>
                <ul className="space-y-1">
                  {suggestions.treatment_recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-slate-700">✓ {rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {suggestions.early_interventions && suggestions.early_interventions.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Early Interventions
                </h4>
                <div className="space-y-2">
                  {suggestions.early_interventions.map((intervention, idx) => (
                    <Alert key={idx} className={
                      intervention.urgency === 'high' ? 'bg-red-50 border-red-200' :
                      intervention.urgency === 'medium' ? 'bg-amber-50 border-amber-200' :
                      'bg-green-50 border-green-200'
                    }>
                      <AlertDescription className="text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge>{intervention.type}</Badge>
                          <Badge variant="outline">{intervention.urgency}</Badge>
                        </div>
                        <p>{intervention.reason}</p>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}