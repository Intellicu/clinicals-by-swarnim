import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, AlertCircle, Info, Lightbulb, TestTube, Stethoscope, Brain, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

// Clinical Decision Support System - runs proactive checks
export default function ClinicalDecisionSupport({ patient, medications, chiefComplaint, onSuggestionAccept }) {
  const [alerts, setAlerts] = useState([]);
  const [diagnosticSuggestions, setDiagnosticSuggestions] = useState([]);
  const [differentialDx, setDifferentialDx] = useState([]);
  const [treatmentPathways, setTreatmentPathways] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expanded, setExpanded] = useState({ alerts: true, diagnostics: false, differential: false, pathways: false });

  useEffect(() => {
    if (medications.length > 0 || chiefComplaint) {
      runClinicalChecks();
    }
  }, [medications, chiefComplaint, patient]);

  const runClinicalChecks = async () => {
    setIsAnalyzing(true);
    try {
      // 1. Drug Interaction & Allergy Alerts
      const drugNames = medications.map(m => m.name).filter(Boolean);
      const currentMeds = patient.current_medications || [];
      const allergies = patient.allergies || [];
      
      const interactionCheck = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a clinical pharmacist. Check for drug interactions and allergy conflicts.
        
New medications being prescribed: ${drugNames.join(", ")}
Patient's current medications: ${currentMeds.join(", ")}
Patient's known allergies: ${allergies.join(", ")}
Patient diagnosis: ${patient.diagnosis || "Not specified"}
Patient age: ${patient.age_years || "Not specified"} years

Analyze and return:
1. Critical drug-drug interactions
2. Allergy conflicts
3. Age-inappropriate medications
4. Duplicate therapy warnings

Return structured alerts with severity (critical/warning/info) and clinical recommendations.`,
        response_json_schema: {
          type: "object",
          properties: {
            alerts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  severity: { type: "string", enum: ["critical", "warning", "info"] },
                  type: { type: "string" },
                  message: { type: "string" },
                  drugs_involved: { type: "array", items: { type: "string" } },
                  recommendation: { type: "string" },
                  reference: { type: "string" }
                }
              }
            }
          }
        }
      });

      setAlerts(interactionCheck.alerts || []);

      // 2. Diagnostic Test Suggestions
      if (chiefComplaint) {
        const diagnosticRec = await base44.integrations.Core.InvokeLLM({
          prompt: `You are a pediatric nephrologist. Based on this clinical presentation, suggest relevant diagnostic tests.

Chief complaint: ${chiefComplaint}
Patient age: ${patient.age_years || "Not specified"} years
Primary diagnosis: ${patient.diagnosis || "Not specified"}
Comorbidities: ${(patient.comorbidities || []).join(", ") || "None"}
Current symptoms context: ${chiefComplaint}

Suggest appropriate diagnostic tests (labs, imaging, procedures) with clinical reasoning. Prioritize by urgency.`,
          response_json_schema: {
            type: "object",
            properties: {
              tests: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    test_name: { type: "string" },
                    priority: { type: "string", enum: ["urgent", "routine", "optional"] },
                    rationale: { type: "string" },
                    expected_findings: { type: "string" },
                    reference_link: { type: "string" }
                  }
                }
              }
            }
          }
        });

        setDiagnosticSuggestions(diagnosticRec.tests || []);

        // 3. Differential Diagnosis Generation (for complex cases)
        const symptomWords = chiefComplaint.toLowerCase();
        if (symptomWords.length > 20 || patient.comorbidities?.length > 1) {
          const ddx = await base44.integrations.Core.InvokeLLM({
            prompt: `Generate a differential diagnosis list for this pediatric nephrology case.

Chief complaint: ${chiefComplaint}
Age: ${patient.age_years} years
Primary diagnosis: ${patient.diagnosis}
Comorbidities: ${(patient.comorbidities || []).join(", ")}
Current medications: ${currentMeds.join(", ")}

Provide top 5 differential diagnoses ranked by likelihood. Include key distinguishing features for each.`,
            response_json_schema: {
              type: "object",
              properties: {
                differentials: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      diagnosis: { type: "string" },
                      likelihood: { type: "string", enum: ["high", "moderate", "low"] },
                      key_features: { type: "string" },
                      tests_to_confirm: { type: "string" },
                      reference: { type: "string" }
                    }
                  }
                }
              }
            }
          });

          setDifferentialDx(ddx.differentials || []);
        }

        // 4. Treatment Pathway Recommendations
        if (patient.diagnosis) {
          const pathways = await base44.integrations.Core.InvokeLLM({
            prompt: `Suggest evidence-based treatment pathways for this patient.

Diagnosis: ${patient.diagnosis}
Age: ${patient.age_years} years
Symptoms: ${chiefComplaint}
Comorbidities: ${(patient.comorbidities || []).join(", ")}

Provide treatment pathway recommendations based on KDIGO, IAP, IPNA, or ISPD guidelines where applicable.`,
            response_json_schema: {
              type: "object",
              properties: {
                pathways: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      guideline_source: { type: "string" },
                      pathway_name: { type: "string" },
                      first_line_treatment: { type: "string" },
                      monitoring_plan: { type: "string" },
                      reference_url: { type: "string" }
                    }
                  }
                }
              }
            }
          });

          setTreatmentPathways(pathways.pathways || []);
        }
      }

      toast.success("Clinical decision support analysis complete");
    } catch (error) {
      toast.error("Failed to run clinical checks");
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const severityConfig = {
    critical: { icon: AlertTriangle, color: "bg-red-100 border-red-300 text-red-900", badge: "bg-red-600 text-white" },
    warning: { icon: AlertCircle, color: "bg-amber-100 border-amber-300 text-amber-900", badge: "bg-amber-600 text-white" },
    info: { icon: Info, color: "bg-blue-100 border-blue-300 text-blue-900", badge: "bg-blue-600 text-white" },
  };

  const priorityConfig = {
    urgent: { color: "bg-red-100 text-red-800 border-red-300", label: "Urgent" },
    routine: { color: "bg-blue-100 text-blue-800 border-blue-300", label: "Routine" },
    optional: { color: "bg-slate-100 text-slate-700 border-slate-300", label: "Optional" },
  };

  const likelihoodConfig = {
    high: { color: "bg-red-100 text-red-800", label: "High" },
    moderate: { color: "bg-amber-100 text-amber-800", label: "Moderate" },
    low: { color: "bg-blue-100 text-blue-800", label: "Low" },
  };

  return (
    <div className="space-y-3">
      {isAnalyzing && (
        <Alert className="bg-purple-50 border-purple-200">
          <Brain className="w-4 h-4 text-purple-600 animate-pulse" />
          <AlertTitle className="text-sm text-purple-900">AI Clinical Analysis Running...</AlertTitle>
          <AlertDescription className="text-xs text-purple-700">Checking drug interactions, suggesting diagnostics, and generating differential diagnoses</AlertDescription>
        </Alert>
      )}

      {/* DRUG INTERACTION ALERTS */}
      {alerts.length > 0 && (
        <Card className="border-2 shadow-md">
          <CardHeader className="pb-2 bg-gradient-to-r from-red-50 to-orange-50 cursor-pointer" onClick={() => setExpanded(e => ({ ...e, alerts: !e.alerts }))}>
            <CardTitle className="text-sm font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                Drug Safety Alerts ({alerts.length})
              </span>
              {expanded.alerts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </CardTitle>
          </CardHeader>
          {expanded.alerts && (
            <CardContent className="p-3 space-y-2">
              {alerts.map((alert, idx) => {
                const config = severityConfig[alert.severity] || severityConfig.info;
                const Icon = config.icon;
                return (
                  <Alert key={idx} className={`${config.color} border`}>
                    <Icon className="w-4 h-4" />
                    <AlertTitle className="text-sm font-semibold flex items-center gap-2">
                      {alert.type}
                      <Badge className={`text-xs ${config.badge}`}>{alert.severity.toUpperCase()}</Badge>
                    </AlertTitle>
                    <AlertDescription className="text-xs mt-1 space-y-1">
                      <p><strong>Issue:</strong> {alert.message}</p>
                      {alert.drugs_involved?.length > 0 && <p><strong>Drugs:</strong> {alert.drugs_involved.join(", ")}</p>}
                      <p className="bg-white/50 p-2 rounded"><strong>Recommendation:</strong> {alert.recommendation}</p>
                      {alert.reference && (
                        <a href={alert.reference} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-700 hover:underline flex items-center gap-1 mt-1">
                          <ExternalLink className="w-3 h-3" />Reference
                        </a>
                      )}
                    </AlertDescription>
                  </Alert>
                );
              })}
            </CardContent>
          )}
        </Card>
      )}

      {/* DIAGNOSTIC TEST SUGGESTIONS */}
      {diagnosticSuggestions.length > 0 && (
        <Card className="border shadow-md">
          <CardHeader className="pb-2 bg-gradient-to-r from-cyan-50 to-blue-50 cursor-pointer" onClick={() => setExpanded(e => ({ ...e, diagnostics: !e.diagnostics }))}>
            <CardTitle className="text-sm font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TestTube className="w-4 h-4 text-cyan-600" />
                Suggested Diagnostic Tests ({diagnosticSuggestions.length})
              </span>
              {expanded.diagnostics ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </CardTitle>
          </CardHeader>
          {expanded.diagnostics && (
            <CardContent className="p-3 space-y-2">
              {diagnosticSuggestions.map((test, idx) => (
                <Card key={idx} className={`border ${priorityConfig[test.priority]?.color || ""}`}>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-sm flex items-center gap-2">
                          {test.test_name}
                          <Badge variant="outline" className="text-xs">{priorityConfig[test.priority]?.label || test.priority}</Badge>
                        </div>
                        <p className="text-xs text-slate-600 mt-1"><strong>Rationale:</strong> {test.rationale}</p>
                        {test.expected_findings && <p className="text-xs text-slate-500 mt-0.5"><strong>Expected:</strong> {test.expected_findings}</p>}
                        {test.reference_link && (
                          <a href={test.reference_link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1">
                            <ExternalLink className="w-3 h-3" />Clinical Reference
                          </a>
                        )}
                      </div>
                      <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => onSuggestionAccept?.({ type: "test", data: test })}>
                        Add to Orders
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          )}
        </Card>
      )}

      {/* DIFFERENTIAL DIAGNOSIS */}
      {differentialDx.length > 0 && (
        <Card className="border shadow-md">
          <CardHeader className="pb-2 bg-gradient-to-r from-purple-50 to-pink-50 cursor-pointer" onClick={() => setExpanded(e => ({ ...e, differential: !e.differential }))}>
            <CardTitle className="text-sm font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-purple-600" />
                Differential Diagnoses ({differentialDx.length})
              </span>
              {expanded.differential ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </CardTitle>
          </CardHeader>
          {expanded.differential && (
            <CardContent className="p-3 space-y-2">
              {differentialDx.map((dx, idx) => (
                <Card key={idx} className="border">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-sm flex items-center gap-2">
                          {idx + 1}. {dx.diagnosis}
                          <Badge className={`text-xs ${likelihoodConfig[dx.likelihood]?.color || "bg-slate-100"}`}>
                            {likelihoodConfig[dx.likelihood]?.label || dx.likelihood}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600 mt-1"><strong>Key Features:</strong> {dx.key_features}</p>
                        {dx.tests_to_confirm && <p className="text-xs text-blue-600 mt-0.5"><strong>Tests to Confirm:</strong> {dx.tests_to_confirm}</p>}
                        {dx.reference && (
                          <a href={dx.reference} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1">
                            <ExternalLink className="w-3 h-3" />Reference
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          )}
        </Card>
      )}

      {/* TREATMENT PATHWAYS */}
      {treatmentPathways.length > 0 && (
        <Card className="border shadow-md">
          <CardHeader className="pb-2 bg-gradient-to-r from-green-50 to-emerald-50 cursor-pointer" onClick={() => setExpanded(e => ({ ...e, pathways: !e.pathways }))}>
            <CardTitle className="text-sm font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-green-600" />
                Evidence-Based Treatment Pathways ({treatmentPathways.length})
              </span>
              {expanded.pathways ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </CardTitle>
          </CardHeader>
          {expanded.pathways && (
            <CardContent className="p-3 space-y-2">
              {treatmentPathways.map((pathway, idx) => (
                <Card key={idx} className="border border-green-200 bg-green-50/30">
                  <CardContent className="p-3">
                    <div className="font-semibold text-sm text-green-900">{pathway.pathway_name}</div>
                    <Badge variant="outline" className="text-xs mt-1">{pathway.guideline_source}</Badge>
                    <p className="text-xs text-slate-700 mt-2"><strong>First-Line:</strong> {pathway.first_line_treatment}</p>
                    {pathway.monitoring_plan && <p className="text-xs text-slate-600 mt-1"><strong>Monitoring:</strong> {pathway.monitoring_plan}</p>}
                    {pathway.reference_url && (
                      <a href={pathway.reference_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-2">
                        <ExternalLink className="w-3 h-3" />View Full Guideline
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          )}
        </Card>
      )}

      {!isAnalyzing && alerts.length === 0 && diagnosticSuggestions.length === 0 && differentialDx.length === 0 && treatmentPathways.length === 0 && (
        <Alert className="bg-green-50 border-green-200">
          <Info className="w-4 h-4 text-green-600" />
          <AlertTitle className="text-sm text-green-900">No Critical Alerts</AlertTitle>
          <AlertDescription className="text-xs text-green-700">
            No drug interactions or safety concerns detected. Clinical decision support will update as you add medications or symptoms.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}