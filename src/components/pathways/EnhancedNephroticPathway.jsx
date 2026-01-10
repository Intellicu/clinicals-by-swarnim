import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Calculator,
  BookOpen,
  Brain,
  Info,
  Pill,
  Activity,
  Microscope,
  ExternalLink
} from "lucide-react";

export default function EnhancedNephroticPathway({ onAIPrompt }) {
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [selectedContext, setSelectedContext] = useState("");

  const handleCalculatorLink = (calcPage) => {
    window.open(createPageUrl(calcPage), '_blank');
  };

  const handleAIPrompt = (prompt) => {
    if (onAIPrompt) {
      onAIPrompt(prompt);
    }
    setSelectedContext(prompt);
    setAiDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="w-5 h-5 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Initial Presentation:</strong> Child with edema, foamy urine, proteinuria (UPCR ≥2 mg/mg). Click on steps for calculators, guidelines, or AI assistance.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader className="bg-green-50 border-b">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="w-5 h-5 text-green-600" />
            Interactive Diagnostic & Treatment Pathway
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Initial Evaluation - Interactive */}
            <Card className="bg-gradient-to-r from-green-100 to-blue-100 border-2 border-green-300 hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle className="text-base text-green-900">
                  STEP 1: Initial Evaluation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid md:grid-cols-2 gap-2">
                  {[
                    { text: "Serum albumin, total protein", calc: "Proteinuria" },
                    { text: "Lipid profile", calc: null },
                    { text: "Renal function (eGFR)", calc: "SchwartzGFR", aiPrompt: "Explain significance of eGFR in nephrotic syndrome" },
                    { text: "Electrolytes, CBC", calc: null }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white p-2 rounded border group hover:border-green-500 transition-all">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-sm">{item.text}</span>
                      </div>
                      {(item.calc || item.aiPrompt) && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.calc && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => handleCalculatorLink(item.calc)}
                            >
                              <Calculator className="w-3 h-3 text-blue-600" />
                            </Button>
                          )}
                          {item.aiPrompt && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => handleAIPrompt(item.aiPrompt)}
                            >
                              <Brain className="w-3 h-3 text-purple-600" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="text-center text-2xl text-slate-400">↓</div>

            {/* Decision Point - Typical vs Atypical */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-green-50 border-2 border-green-300 hover:shadow-xl transition-all cursor-pointer group">
                <CardContent className="p-4">
                  <Badge className="bg-green-600 text-white mb-2">Typical Features</Badge>
                  <h4 className="font-bold text-green-900 mb-2">Empiric Steroid Therapy</h4>
                  <p className="text-sm text-green-800 mb-3">Prednisolone 60 mg/m²/day × 4-6 weeks</p>
                  
                  <div className="space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full justify-start border-blue-300"
                      onClick={() => handleCalculatorLink("Anthropometry")}
                    >
                      <Calculator className="w-3 h-3 mr-2" />
                      Calculate BSA
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full justify-start border-purple-300"
                      onClick={() => handleAIPrompt("What are the typical features of nephrotic syndrome that support empiric steroid therapy?")}
                    >
                      <Brain className="w-3 h-3 mr-2" />
                      Ask AI
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-red-50 border-2 border-red-300 hover:shadow-xl transition-all cursor-pointer group">
                <CardContent className="p-4">
                  <Badge className="bg-red-600 text-white mb-2">Atypical Features</Badge>
                  <h4 className="font-bold text-red-900 mb-2">Consider Biopsy</h4>
                  <ul className="text-sm text-red-800 space-y-1 mb-3">
                    <li>• Age under 1 or over 10</li>
                    <li>• Low C3 or positive serology</li>
                    <li>• Gross hematuria or renal insufficiency</li>
                  </ul>
                  
                  <div className="space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full justify-start border-purple-300"
                      onClick={() => handleAIPrompt("What are atypical features requiring kidney biopsy in nephrotic syndrome?")}
                    >
                      <Brain className="w-3 h-3 mr-2" />
                      Ask AI About Biopsy Indications
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center text-2xl text-slate-400">↓</div>

            {/* Management Steps - Interactive */}
            <Card className="bg-blue-50 border-2 border-blue-300">
              <CardHeader>
                <CardTitle className="text-base text-blue-900">
                  STEP 2: General Management (All Patients)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { 
                    text: "Monitor BP - treat if >95th percentile", 
                    calc: "BPPercentiles",
                    guidelineRef: "KDIGO BP Guidelines",
                    aiPrompt: "What are BP targets in pediatric nephrotic syndrome?"
                  },
                  { 
                    text: "Low-salt diet, fluid restrict if edematous", 
                    calc: null,
                    aiPrompt: "Dietary recommendations for nephrotic syndrome in children"
                  },
                  { 
                    text: "Prophylactic antibiotics while albumin <2 g/dL", 
                    calc: null,
                    guidelineRef: "KDIGO Nephrotic Syndrome Guidelines",
                    aiPrompt: "Why antibiotic prophylaxis in severe hypoalbuminemia?"
                  },
                  { 
                    text: "DVT prophylaxis if albumin <2 + bedbound", 
                    calc: null,
                    aiPrompt: "DVT risk and prophylaxis in nephrotic syndrome"
                  }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white p-3 rounded border group hover:border-blue-500 transition-all">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5" />
                      <span className="text-sm">{item.text}</span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.calc && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2"
                          onClick={() => handleCalculatorLink(item.calc)}
                        >
                          <Calculator className="w-3 h-3 text-blue-600" />
                        </Button>
                      )}
                      {item.guidelineRef && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2"
                          onClick={() => handleAIPrompt(`Summarize: ${item.guidelineRef}`)}
                        >
                          <BookOpen className="w-3 h-3 text-purple-600" />
                        </Button>
                      )}
                      {item.aiPrompt && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2"
                          onClick={() => handleAIPrompt(item.aiPrompt)}
                        >
                          <Brain className="w-3 h-3 text-indigo-600" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Alert className="bg-purple-50 border-purple-200">
              <Microscope className="w-4 h-4 text-purple-600" />
              <AlertDescription className="text-purple-800 text-sm">
                <strong>Interactive Features:</strong> Hover over any step to see quick links to calculators, guidelines, or ask AI for clarification. Click icons to open tools in new tabs.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              AI Assistant Prompt
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-700">Prompt sent to AI:</p>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-900">{selectedContext}</p>
            </div>
            <Link to={createPageUrl("AIAssistant")}>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open AI Assistant
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}