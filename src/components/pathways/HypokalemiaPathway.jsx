import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Zap, Calculator } from 'lucide-react';
import EnhancedInteractiveStep from './EnhancedInteractiveStep';

export default function HypokalemiaPathway() {
  const [serumK, setSerumK] = useState('');
  const [weight, setWeight] = useState('');
  const [ecgChanges, setEcgChanges] = useState(false);
  const [calculated, setCalculated] = useState(false);

  const handleCalculate = () => setCalculated(true);

  const k = parseFloat(serumK);
  const severity = k < 2.5 ? 'severe' : k < 3.0 ? 'moderate' : 'mild';

  const steps = calculated ? [
    {
      title: `Assess Severity: ${severity.toUpperCase()} Hypokalemia`,
      description: `K+ = ${serumK} mmol/L`,
      priority: severity === 'severe' ? 'critical' : 'important',
      content: k < 2.5 ? 
        '⚠️ SEVERE - Risk of arrhythmias, paralysis. IV replacement needed immediately.' :
        k < 3.0 ? 'MODERATE - Urgent oral replacement, monitor ECG' :
        'MILD - Oral replacement, identify cause',
      inlineCalculator: {
        type: 'dose',
        label: 'Potassium Replacement Dose',
        fields: [
          { name: 'weight', label: 'Weight (kg)', placeholder: weight || '25' },
          { name: 'deficit', label: 'K+ Deficit (mEq)', placeholder: ((3.5 - k) * parseFloat(weight) * 0.3).toFixed(0) }
        ],
        dosePerKg: (3.5 - k) * 0.3,
        unit: 'mEq'
      }
    },
    {
      title: 'ECG Monitoring',
      content: 'Check for: U waves, T wave flattening, ST depression, prolonged QT, PVCs',
      priority: severity === 'severe' ? 'critical' : 'important'
    },
    {
      title: 'IV Replacement Protocol',
      content: k < 2.5 ? `• KCl 0.5 mEq/kg/dose IV over 1 hour
• Max concentration: 40 mEq/L peripheral line, 80 mEq/L central line
• Max rate: 0.5 mEq/kg/hr (NEVER exceed 1 mEq/kg/hr)
• Continuous ECG monitoring
• Recheck K+ after each dose` : 'Oral replacement preferred if K+ >2.5',
      priority: 'critical',
      branchOn: (data) => k < 2.5 ? 'Severe protocol activated' : null
    },
    {
      title: 'Oral Replacement',
      content: `• KCl liquid/syrup: 1-2 mEq/kg/day divided TID-QID
• Increase dietary K+: Bananas, oranges, potatoes
• Monitor K+ daily until >3.5 mmol/L`,
      priority: 'important'
    }
  ] : [];

  return (
    <div className="space-y-6">
      <Alert className="bg-yellow-50 border-yellow-300">
        <Zap className="w-5 h-5 text-yellow-600" />
        <AlertDescription className="text-yellow-900">
          <strong>Hypokalemia Protocol:</strong> K+ &lt;3.5 mmol/L - Cardiac arrhythmia risk
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader className="bg-slate-50">
          <CardTitle>Initial Assessment</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Serum K+ (mmol/L) *</Label>
              <Input
                type="number"
                step="0.1"
                value={serumK}
                onChange={(e) => setSerumK(e.target.value)}
                placeholder="e.g., 2.8"
              />
            </div>
            <div>
              <Label>Weight (kg) *</Label>
              <Input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g., 25"
              />
            </div>
          </div>
          <Button
            onClick={handleCalculate}
            disabled={!serumK || !weight}
            className="w-full bg-yellow-600 hover:bg-yellow-700"
          >
            <Calculator className="w-4 h-4 mr-2" />
            Generate Management Plan
          </Button>
        </CardContent>
      </Card>

      {calculated && (
        <div className="space-y-3">
          {steps.map((step, idx) => (
            <EnhancedInteractiveStep
              key={idx}
              step={step}
              index={idx}
              isCompleted={false}
              onToggleComplete={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
}