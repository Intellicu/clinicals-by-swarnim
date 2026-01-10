import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Calculator, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function EnhancedInteractiveStep({ 
  step, 
  index, 
  isCompleted, 
  onToggleComplete,
  onDataChange 
}) {
  const [isExpanded, setIsExpanded] = useState(index === 0);
  const [inputValues, setInputValues] = useState({});
  const [calculatedResult, setCalculatedResult] = useState(null);
  const [showBranch, setShowBranch] = useState(null);

  useEffect(() => {
    if (step.inlineCalculator && Object.keys(inputValues).length > 0) {
      performInlineCalculation();
    }
  }, [inputValues]);

  const performInlineCalculation = () => {
    const calc = step.inlineCalculator;
    let result = null;

    try {
      if (calc.type === 'gfr') {
        const height = parseFloat(inputValues.height);
        const creatinine = parseFloat(inputValues.creatinine);
        if (height && creatinine) {
          result = (0.413 * height / creatinine).toFixed(1);
          setCalculatedResult({
            value: result,
            unit: 'mL/min/1.73m²',
            interpretation: result > 90 ? 'Normal' : result > 60 ? 'Mild reduction' : result > 30 ? 'Moderate CKD' : 'Severe CKD'
          });
          
          // Trigger branching logic
          if (calc.branchOn) {
            const branch = calc.branchOn(result);
            setShowBranch(branch);
          }
        }
      } else if (calc.type === 'bmi') {
        const weight = parseFloat(inputValues.weight);
        const height = parseFloat(inputValues.height);
        if (weight && height) {
          const heightM = height / 100;
          result = (weight / (heightM * heightM)).toFixed(1);
          setCalculatedResult({
            value: result,
            unit: 'kg/m²',
            interpretation: result < 18.5 ? 'Underweight' : result < 25 ? 'Normal' : result < 30 ? 'Overweight' : 'Obese'
          });
        }
      } else if (calc.type === 'dose') {
        const weight = parseFloat(inputValues.weight);
        const dosePerKg = parseFloat(calc.dosePerKg);
        if (weight && dosePerKg) {
          result = (weight * dosePerKg).toFixed(1);
          setCalculatedResult({
            value: result,
            unit: calc.unit || 'mg',
            interpretation: `Calculated dose: ${result} ${calc.unit}`
          });
        }
      }

      if (onDataChange && result) {
        onDataChange(index, { ...inputValues, calculatedResult: result });
      }
    } catch (error) {
      console.error('Calculation error:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setInputValues(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className={`border-2 transition-all ${
      isCompleted ? 'bg-green-50 border-green-400' :
      isExpanded ? 'bg-blue-50 border-blue-300' :
      'bg-white border-slate-200'
    }`}>
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete(index);
            }}
            className="flex-shrink-0 mt-1"
          >
            {isCompleted ? (
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            ) : (
              <Circle className="w-6 h-6 text-slate-400 hover:text-slate-600" />
            )}
          </button>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="bg-slate-200 text-slate-800 font-bold">
                  {index + 1}
                </Badge>
                <h4 className={`font-semibold ${isCompleted ? 'text-green-800' : 'text-slate-900'}`}>
                  {step.title}
                </h4>
                {step.priority === 'critical' && (
                  <Badge className="bg-red-500 text-white text-xs">CRITICAL</Badge>
                )}
              </div>
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
            
            {!isExpanded && (
              <p className="text-sm text-slate-600 mt-1">{step.description}</p>
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <CardContent className="pt-0 pb-4 px-4 pl-14 space-y-4">
          <p className="text-sm text-slate-700">{step.content}</p>

          {step.inlineCalculator && (
            <Card className="bg-purple-50 border-2 border-purple-300">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="w-4 h-4 text-purple-600" />
                  <span className="font-semibold text-sm text-purple-900">
                    {step.inlineCalculator.label}
                  </span>
                </div>

                <div className="grid gap-3">
                  {step.inlineCalculator.fields.map((field, idx) => (
                    <div key={idx}>
                      <Label className="text-xs">{field.label}</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={inputValues[field.name] || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        placeholder={field.placeholder}
                        className="mt-1 h-9"
                      />
                    </div>
                  ))}
                </div>

                {calculatedResult && (
                  <Alert className="bg-green-100 border-green-300 mt-3">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <AlertDescription className="text-green-900 text-sm">
                      <div className="font-bold">
                        Result: {calculatedResult.value} {calculatedResult.unit}
                      </div>
                      <div className="text-xs mt-1">{calculatedResult.interpretation}</div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {showBranch && (
            <Alert className="bg-amber-50 border-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <AlertDescription className="text-amber-900 text-sm">
                <div className="font-semibold mb-1">Pathway Branch Activated:</div>
                <div>{showBranch}</div>
              </AlertDescription>
            </Alert>
          )}

          {step.externalLinks && (
            <div className="space-y-2">
              {step.externalLinks.map((link, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => window.open(link.url, '_blank')}
                >
                  {link.title}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}