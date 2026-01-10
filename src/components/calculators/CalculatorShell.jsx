import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Info, Calendar, BookOpen, Activity, Download, Copy } from "lucide-react";

export default function CalculatorShell({
  title,
  description,
  lastReviewed,
  references,
  children,
  results,
  loading = false,
  showMonitoring = false,
  onCopyPrescription,
  onDownloadPrescription
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{title}</h1>
        <p className="text-slate-600">{description}</p>
        <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Last reviewed: {lastReviewed}
          </div>
          {references && (
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {references}
            </div>
          )}
        </div>
      </div>

      {/* Input Form */}
      <Card className="bg-white shadow-lg">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-lg">Patient Information & Parameters</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {children}
        </CardContent>
      </Card>

      {/* Results Section */}
      {results && !loading && (
        <Card className="bg-white shadow-lg">
          <CardHeader className={`border-b ${
            results.safetyLevel === "critical" ? "bg-red-50" :
            results.safetyLevel === "caution" ? "bg-amber-50" :
            "bg-green-50"
          }`}>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                {results.safetyLevel === "critical" ? (
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                ) : results.safetyLevel === "caution" ? (
                  <Info className="w-5 h-5 text-amber-600" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
                Results
              </CardTitle>
              {(onCopyPrescription || onDownloadPrescription) && (
                <div className="flex gap-2">
                  {onCopyPrescription && (
                    <Button size="sm" variant="outline" onClick={onCopyPrescription}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  )}
                  {onDownloadPrescription && (
                    <Button size="sm" variant="outline" onClick={onDownloadPrescription}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="results" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="results">Results</TabsTrigger>
                {results.calculationTrace && (
                  <TabsTrigger value="calculation">Calculation</TabsTrigger>
                )}
                {(results.monitoringPlan || showMonitoring) && (
                  <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="results" className="space-y-4 mt-4">
                {/* Primary Results */}
                {results.primaryResults && (
                  <div className="grid md:grid-cols-2 gap-4">
                    {results.primaryResults.map((result, idx) => (
                      <Card key={idx} className="bg-slate-50">
                        <CardContent className="p-4">
                          <div className="text-sm text-slate-600 mb-1">{result.label}</div>
                          <div className="text-2xl font-bold text-slate-900">{result.value}</div>
                          {result.subtext && (
                            <div className="text-xs text-slate-500 mt-1">{result.subtext}</div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Safety Alerts */}
                {results.safetyAlerts && results.safetyAlerts.length > 0 && (
                  <div className="space-y-3 mt-4">
                    {results.safetyAlerts.map((alert, idx) => (
                      <Alert key={idx} className={
                        alert.severity === "critical" ? "bg-red-50 border-red-200" :
                        alert.severity === "warning" ? "bg-amber-50 border-amber-200" :
                        "bg-blue-50 border-blue-200"
                      }>
                        <AlertTriangle className={`w-4 h-4 ${
                          alert.severity === "critical" ? "text-red-600" :
                          alert.severity === "warning" ? "text-amber-600" :
                          "text-blue-600"
                        }`} />
                        <AlertDescription>
                          <strong>{alert.title}</strong>
                          <p className="text-sm mt-1">{alert.message}</p>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}

                {/* Prescription Text */}
                {results.prescriptionText && (
                  <Card className="bg-slate-50 mt-4">
                    <CardContent className="p-4">
                      <pre className="text-sm whitespace-pre-wrap font-mono text-slate-800">
                        {results.prescriptionText}
                      </pre>
                    </CardContent>
                  </Card>
                )}

                {/* Additional Info */}
                {results.additionalInfo && results.additionalInfo.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {results.additionalInfo.map((info, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>{info}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* References */}
                {results.references && results.references.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h3 className="text-sm font-semibold text-slate-900 mb-2">References</h3>
                    <ul className="text-xs text-slate-600 space-y-1">
                      {results.references.map((ref, idx) => (
                        <li key={idx}>{idx + 1}. {ref}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>

              {results.calculationTrace && (
                <TabsContent value="calculation" className="mt-4">
                  <Card className="bg-slate-50">
                    <CardContent className="p-4">
                      <h3 className="text-sm font-semibold text-slate-900 mb-3">Step-by-Step Calculation</h3>
                      <div className="space-y-2">
                        {results.calculationTrace.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <Badge className="bg-slate-200 text-slate-800">{idx + 1}</Badge>
                            <span className="text-slate-700">{step}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {(results.monitoringPlan || showMonitoring) && (
                <TabsContent value="monitoring" className="mt-4">
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Monitoring Plan
                      </h3>
                      {results.monitoringPlan ? (
                        <ul className="space-y-2">
                          {results.monitoringPlan.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-blue-800">
                              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-blue-800">
                          Regular monitoring recommended. Consult clinical guidelines for specific parameters.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card className="bg-white shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Calculating results...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}