import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Brain, AlertTriangle, Loader2, CheckCircle, LineChart
} from "lucide-react";
import { toast } from "sonner";

export default function EnhancedAITreatment({ patient }) {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const { data: visits = [] } = useQuery({
    queryKey: ['patient-visits', patient.id],
    queryFn: () => base44.entities.VisitRecord.filter({ patient_id: patient.id }, '-visit_date', 10),
    enabled: !!patient
  });

  const { data: drugs = [] } = useQuery({
    queryKey: ['drugs'],
    queryFn: () => base44.entities.Drug.list()
  });

  const analyzeComprehensive = async () => {
    setIsAnalyzing(true);
    toast.info("AI performing comprehensive analysis...", { id: "analysis", duration: Infinity });

    try {
      const labTrends = visits.map(v => ({
        date: v.visit_date,
        creatinine: v.lab_results?.creatinine,
        egfr: v.lab_results?.egfr,
        bp_systolic: v.physical_examination?.bp_systolic
      }));

      const prompt = `Comprehensive AI treatment analysis for pediatric nephrology patient:

PATIENT: ${patient.patient_name}, ${patient.age_years}y, ${patient.gender}
DIAGNOSIS: ${patient.diagnosis}
CURRENT MEDICATIONS: ${patient.current_medications?.join(", ") || "None"}
ALLERGIES: ${patient.allergies?.join(", ") || "None"}

LAB TRENDS (last 10 visits):
${JSON.stringify(labTrends, null, 2)}

PROVIDE COMPREHENSIVE ANALYSIS:

1. DRUG RECOMMENDATIONS:
   - List 3-5 appropriate drugs with specific formulations available in India
   - Include dose calculations (mg/kg/day)
   - Route and frequency
   - Monitoring requirements

2. DRUG INTERACTIONS:
   - Check ALL current medications
   - Flag major/moderate/minor interactions
   - Suggest alternatives if interactions found

3. SUPPORTIVE MANAGEMENT:
   - Non-pharmacological interventions
   - Lifestyle modifications
   - Follow-up schedule

4. DIET CHART:
   - Protein restriction (if needed)
   - Sodium/potassium/phosphorus modifications
   - Fluid allowance
   - Sample meal plan

5. LONGITUDINAL TREND ANALYSIS:
   - GFR trend (improving/stable/declining)
   - BP control assessment
   - Risk stratification (low/medium/high risk for progression)
   - Early intervention opportunities

Return JSON:`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            drug_recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  drug_name: { type: "string" },
                  formulation: { type: "string" },
                  dose_calculation: { type: "string" },
                  route: { type: "string" },
                  frequency: { type: "string" },
                  monitoring: { type: "string" }
                }
              }
            },
            drug_interactions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  severity: { type: "string" },
                  drugs_involved: { type: "string" },
                  mechanism: { type: "string" },
                  action: { type: "string" }
                }
              }
            },
            supportive_management: {
              type: "array",
              items: { type: "string" }
            },
            diet_chart: {
              type: "object",
              properties: {
                protein_grams_per_kg: { type: "string" },
                sodium_restriction: { type: "string" },
                potassium_restriction: { type: "string" },
                fluid_allowance: { type: "string" },
                sample_meals: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            },
            trend_analysis: {
              type: "object",
              properties: {
                gfr_trend: { type: "string" },
                risk_level: { type: "string" },
                progression_rate: { type: "string" },
                alerts: { type: "array", items: { type: "string" } },
                interventions_needed: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      });

      setAnalysis(result);
      toast.success("Analysis complete!", { id: "analysis" });
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Analysis failed", { id: "analysis" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="shadow-xl border-2 border-purple-200">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            AI Treatment Suite
          </CardTitle>
          <Button
            onClick={analyzeComprehensive}
            disabled={isAnalyzing}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Analyze"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {!analysis ? (
          <Alert className="bg-purple-50 border-purple-200">
            <AlertDescription>
              Click "Analyze" for comprehensive AI treatment recommendations including drug suggestions, interactions, diet charts, and trend analysis.
            </AlertDescription>
          </Alert>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="drugs">Drugs</TabsTrigger>
              <TabsTrigger value="interactions">Interactions</TabsTrigger>
              <TabsTrigger value="diet">Diet</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-3">
              {analysis.trend_analysis?.alerts?.map((alert, idx) => (
                <Alert key={idx} className="bg-red-50 border-red-200">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <AlertDescription className="text-red-900">{alert}</AlertDescription>
                </Alert>
              ))}
            </TabsContent>

            <TabsContent value="drugs" className="space-y-3">
              {analysis.drug_recommendations?.map((drug, idx) => (
                <Card key={idx} className="border-2">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-bold text-slate-900">{drug.drug_name}</h4>
                        <p className="text-sm text-slate-600">{drug.formulation}</p>
                      </div>
                      <Badge className="bg-green-600">Recommended</Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><strong>Dose:</strong> {drug.dose_calculation}</p>
                      <p><strong>Route:</strong> {drug.route}</p>
                      <p><strong>Frequency:</strong> {drug.frequency}</p>
                      <p className="text-xs text-slate-500">{drug.monitoring}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="interactions" className="space-y-3">
              {analysis.drug_interactions?.map((interaction, idx) => (
                <Alert key={idx} className={
                  interaction.severity === 'major' ? 'bg-red-50 border-red-200' :
                  interaction.severity === 'moderate' ? 'bg-amber-50 border-amber-200' :
                  'bg-blue-50 border-blue-200'
                }>
                  <AlertDescription>
                    <Badge className={
                      interaction.severity === 'major' ? 'bg-red-600' :
                      interaction.severity === 'moderate' ? 'bg-amber-600' : 'bg-blue-600'
                    }>{interaction.severity}</Badge>
                    <p className="mt-2 font-semibold">{interaction.drugs_involved}</p>
                    <p className="text-sm mt-1">{interaction.mechanism}</p>
                    <p className="text-sm font-semibold mt-2">Action: {interaction.action}</p>
                  </AlertDescription>
                </Alert>
              ))}
            </TabsContent>

            <TabsContent value="diet">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h4 className="font-semibold text-green-900">Nutritional Guidelines</h4>
                    <div className="text-sm space-y-1 mt-2">
                      <p><strong>Protein:</strong> {analysis.diet_chart?.protein_grams_per_kg}</p>
                      <p><strong>Sodium:</strong> {analysis.diet_chart?.sodium_restriction}</p>
                      <p><strong>Potassium:</strong> {analysis.diet_chart?.potassium_restriction}</p>
                      <p><strong>Fluids:</strong> {analysis.diet_chart?.fluid_allowance}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-900">Sample Meals:</h4>
                    <ul className="text-sm space-y-1 mt-2">
                      {analysis.diet_chart?.sample_meals?.map((meal, idx) => (
                        <li key={idx}>• {meal}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <LineChart className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-900">Longitudinal Analysis</h4>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <Badge className={
                        analysis.trend_analysis?.gfr_trend?.includes('declining') ? 'bg-red-600' :
                        analysis.trend_analysis?.gfr_trend?.includes('stable') ? 'bg-green-600' :
                        'bg-blue-600'
                      }>{analysis.trend_analysis?.gfr_trend}</Badge>
                    </div>
                    <div>
                      <strong>Risk Level:</strong> {analysis.trend_analysis?.risk_level}
                    </div>
                    <div>
                      <strong>Progression Rate:</strong> {analysis.trend_analysis?.progression_rate}
                    </div>
                    {analysis.trend_analysis?.interventions_needed?.length > 0 && (
                      <div>
                        <strong>Recommended Interventions:</strong>
                        <ul className="mt-2 space-y-1">
                          {analysis.trend_analysis.interventions_needed.map((intervention, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                              {intervention}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}