import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  CheckCircle, 
  Circle, 
  ArrowRight, 
  ArrowDown,
  AlertCircle,
  FileText,
  Lightbulb,
  Calculator,
  BookOpen,
  Brain,
  ExternalLink,
  Sparkles
} from "lucide-react";

export default function InteractivePathway({ pathwayData, onAIPrompt }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPath, setSelectedPath] = useState([]);
  const [answers, setAnswers] = useState({});
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  if (!pathwayData || !pathwayData.steps) {
    return null;
  }

  const { steps, title, description } = pathwayData;
  const step = steps[currentStep];

  const handleAnswer = (answer) => {
    const newAnswers = { ...answers, [currentStep]: answer };
    setAnswers(newAnswers);
    
    const newPath = [...selectedPath, { step: currentStep, answer, stepData: step }];
    setSelectedPath(newPath);

    const nextStepId = step.options?.find(opt => opt.value === answer)?.nextStep;
    
    if (nextStepId !== undefined && nextStepId !== null) {
      setCurrentStep(nextStepId);
    } else {
      setCurrentStep(-1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setSelectedPath([]);
    setAnswers({});
  };

  const handleBack = () => {
    if (selectedPath.length > 0) {
      const previousPath = selectedPath.slice(0, -1);
      setSelectedPath(previousPath);
      
      if (previousPath.length > 0) {
        setCurrentStep(previousPath[previousPath.length - 1].step);
      } else {
        setCurrentStep(0);
      }
      
      const newAnswers = { ...answers };
      delete newAnswers[currentStep];
      setAnswers(newAnswers);
    }
  };

  const handleCalculatorClick = (calcName) => {
    window.open(createPageUrl(calcName), '_blank');
  };

  const handleGuidelineClick = (item) => {
    setSelectedItem(item);
    setAiDialogOpen(true);
  };

  const handleAIAssist = (context) => {
    if (onAIPrompt) {
      onAIPrompt(context);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="text-xl text-blue-900">{title}</CardTitle>
          <p className="text-sm text-blue-700 mt-1">{description}</p>
        </CardHeader>
      </Card>

      {selectedPath.length > 0 && (
        <Card className="bg-slate-50">
          <CardHeader>
            <CardTitle className="text-base">Your Clinical Path</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedPath.map((pathItem, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-slate-700">
                    <strong>{pathItem.stepData.question}</strong> → {pathItem.answer}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === -1 ? (
        <Card className="bg-green-50 border-2 border-green-200">
          <CardHeader className="bg-green-100 border-b border-green-200">
            <CardTitle className="text-lg text-green-900 flex items-center gap-2">
              <CheckCircle className="w-6 h-6" />
              Pathway Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {step?.result && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-green-900 mb-2">Diagnosis / Conclusion:</h3>
                  <p className="text-green-800">{step.result.diagnosis}</p>
                </div>

                {step.result.recommendations && step.result.recommendations.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-green-900 mb-2">Recommendations:</h3>
                    <div className="space-y-2">
                      {step.result.recommendations.map((rec, idx) => {
                        const hasCalculator = rec.calculatorLink;
                        const hasGuideline = rec.guidelineRef;
                        
                        return (
                          <Card key={idx} className="bg-white border hover:border-green-400 transition-all">
                            <CardContent className="p-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-2 flex-1">
                                  <ArrowRight className="w-4 h-4 flex-shrink-0 mt-0.5 text-green-600" />
                                  <span className="text-sm text-green-800">{rec.text || rec}</span>
                                </div>
                                <div className="flex gap-1">
                                  {hasCalculator && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 px-2 border-blue-300"
                                      onClick={() => handleCalculatorClick(rec.calculatorLink)}
                                    >
                                      <Calculator className="w-3 h-3 mr-1" />
                                      Calc
                                    </Button>
                                  )}
                                  {hasGuideline && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 px-2 border-purple-300"
                                      onClick={() => handleGuidelineClick(rec)}
                                    >
                                      <BookOpen className="w-3 h-3 mr-1" />
                                      Guide
                                    </Button>
                                  )}
                                  {(rec.aiPrompt || !hasCalculator && !hasGuideline) && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 px-2 border-indigo-300"
                                      onClick={() => handleAIAssist(rec.aiPrompt || `Help me understand: ${rec.text || rec}`)}
                                    >
                                      <Brain className="w-3 h-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}

                {step.result.nextSteps && step.result.nextSteps.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-green-900 mb-2">Next Steps:</h3>
                    <ul className="space-y-2">
                      {step.result.nextSteps.map((next, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-green-800">
                          <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>{next}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 mt-6">
              <Button onClick={handleReset} className="bg-green-600 hover:bg-green-700">
                Start New Pathway
              </Button>
              {selectedPath.length > 0 && (
                <Button onClick={handleBack} variant="outline">
                  Go Back
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white shadow-lg">
          <CardHeader className="bg-slate-50 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Step {currentStep + 1} of {steps.length}
              </CardTitle>
              <div className="flex gap-2">
                <Badge className={`${
                  step.type === "decision" ? "bg-purple-100 text-purple-800" : 
                  step.type === "assessment" ? "bg-blue-100 text-blue-800" : 
                  "bg-slate-100 text-slate-800"
                }`}>
                  {step.type === "decision" ? "Decision Point" : 
                   step.type === "assessment" ? "Assessment" : 
                   "Information"}
                </Badge>
                {step.calculatorLink && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 border-blue-400"
                    onClick={() => handleCalculatorClick(step.calculatorLink)}
                  >
                    <Calculator className="w-3 h-3 mr-1" />
                    Use Calculator
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 mb-2">{step.question}</h2>
              {step.context && (
                <p className="text-sm text-slate-600">{step.context}</p>
              )}
            </div>

            {step.reasoning && (
              <Alert className="mb-6 bg-blue-50 border-blue-200">
                <Lightbulb className="w-4 h-4 text-blue-600" />
                <AlertDescription>
                  <strong className="text-blue-900">Clinical Reasoning:</strong>
                  <p className="text-sm text-blue-800 mt-1">{step.reasoning}</p>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              {step.options?.map((option, idx) => {
                const hasLinks = option.calculatorLink || option.guidelineRef || option.aiPrompt;
                
                return (
                  <Card
                    key={idx}
                    className="border-2 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div 
                          className="flex items-start gap-3 flex-1"
                          onClick={() => handleAnswer(option.value)}
                        >
                          <Circle className="w-5 h-5 flex-shrink-0 mt-1 text-blue-600" />
                          <div className="flex-1">
                            <div className="font-semibold text-slate-900">{option.label}</div>
                            {option.description && (
                              <div className="text-xs text-slate-600 mt-1">{option.description}</div>
                            )}
                          </div>
                        </div>
                        
                        {hasLinks && (
                          <div className="flex gap-1 flex-shrink-0">
                            {option.calculatorLink && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 border-blue-300"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCalculatorClick(option.calculatorLink);
                                }}
                              >
                                <Calculator className="w-3 h-3 mr-1" />
                                Calc
                              </Button>
                            )}
                            {option.guidelineRef && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 border-purple-300"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleGuidelineClick(option);
                                }}
                              >
                                <BookOpen className="w-3 h-3 mr-1" />
                                Guide
                              </Button>
                            )}
                            {option.aiPrompt && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 border-indigo-300"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAIAssist(option.aiPrompt);
                                }}
                              >
                                <Brain className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex gap-2 mt-6 pt-6 border-t">
              {selectedPath.length > 0 && (
                <Button onClick={handleBack} variant="outline">
                  ← Back
                </Button>
              )}
              <Button onClick={handleReset} variant="outline" className="ml-auto">
                Reset Pathway
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              Guideline Reference
            </DialogTitle>
          </DialogHeader>
          {selectedItem?.guidelineRef && (
            <div className="space-y-4">
              <Alert className="bg-purple-50 border-purple-200">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <AlertDescription className="text-purple-800">
                  <strong>Quick Reference:</strong> {selectedItem.guidelineRef}
                </AlertDescription>
              </Alert>
              <div className="flex gap-2">
                <Link to={createPageUrl("Guidelines")} className="flex-1">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    <FileText className="w-4 h-4 mr-2" />
                    View Full Guideline
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    handleAIAssist(`Summarize the key points from: ${selectedItem.guidelineRef}`);
                    setAiDialogOpen(false);
                  }}
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Ask AI
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}