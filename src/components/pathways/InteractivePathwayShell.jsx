import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Circle, ChevronRight, Calculator, ExternalLink, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function InteractivePathwayShell({ 
  title, 
  steps, 
  pathwayId 
}) {
  const [completedSteps, setCompletedSteps] = useState([]);
  const [expandedStep, setExpandedStep] = useState(0);

  useEffect(() => {
    // Load progress from localStorage
    const saved = localStorage.getItem(`pathway_progress_${pathwayId}`);
    if (saved) {
      setCompletedSteps(JSON.parse(saved));
    }
  }, [pathwayId]);

  const toggleStep = (index) => {
    const newCompleted = completedSteps.includes(index)
      ? completedSteps.filter(i => i !== index)
      : [...completedSteps, index];
    
    setCompletedSteps(newCompleted);
    localStorage.setItem(`pathway_progress_${pathwayId}`, JSON.stringify(newCompleted));
    
    if (!completedSteps.includes(index)) {
      toast.success('Step marked as complete!');
    }
  };

  const progress = (completedSteps.length / steps.length) * 100;

  const copyStep = (content) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-slate-900">Progress Tracker</h3>
            <Badge className="bg-blue-600 text-white">
              {completedSteps.length}/{steps.length} Complete
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      <div className="space-y-3">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(index);
          const isExpanded = expandedStep === index;

          return (
            <Card
              key={index}
              className={`border-2 transition-all ${
                isCompleted 
                  ? 'bg-green-50 border-green-300' 
                  : 'bg-white border-slate-200 hover:border-blue-300'
              }`}
            >
              <CardHeader 
                className="cursor-pointer"
                onClick={() => setExpandedStep(isExpanded ? null : index)}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStep(index);
                    }}
                    className="flex-shrink-0 mt-1"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-400" />
                    )}
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        Step {index + 1}: {step.title}
                      </CardTitle>
                      <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                    {step.priority && (
                      <Badge className={`mt-2 ${
                        step.priority === 'critical' ? 'bg-red-500' :
                        step.priority === 'important' ? 'bg-amber-500' :
                        'bg-blue-500'
                      } text-white`}>
                        {step.priority.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0 pl-14">
                  <div className="space-y-4">
                    <div className="text-sm text-slate-700 leading-relaxed">
                      {step.content}
                    </div>

                    {step.calculator && (
                      <Alert className="bg-purple-50 border-purple-200">
                        <Calculator className="w-4 h-4 text-purple-600" />
                        <AlertDescription>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-purple-900">{step.calculator.label}</span>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => window.open(step.calculator.url, '_blank')}
                            >
                              Calculate
                              <ChevronRight className="w-3 h-3 ml-1" />
                            </Button>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    {step.externalLinks && step.externalLinks.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-slate-600">Resources:</p>
                        {step.externalLinks.map((link, idx) => (
                          <Button
                            key={idx}
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => window.open(link.url, '_blank')}
                          >
                            <ExternalLink className="w-3 h-3 mr-2" />
                            {link.title}
                          </Button>
                        ))}
                      </div>
                    )}

                    {step.dynamicFields && (
                      <div className="bg-blue-50 p-3 rounded border border-blue-200">
                        {step.dynamicFields}
                      </div>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyStep(step.content)}
                      className="w-full"
                    >
                      <Copy className="w-3 h-3 mr-2" />
                      Copy Step Details
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}