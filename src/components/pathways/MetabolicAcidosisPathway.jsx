import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wind, Calculator } from 'lucide-react';
import EnhancedInteractiveStep from './EnhancedInteractiveStep';

export default function MetabolicAcidosisPathway() {
  const [ph, setPh] = useState('');
  const [bicarb, setBicarb] = useState('');
  const [na, setNa] = useState('');
  const [cl, setCl] = useState('');
  const [weight, setWeight] = useState('');
  const [calculated, setCalculated] = useState(false);

  const handleCalculate = () => setCalculated(true);

  const pH = parseFloat(ph);
  const hco3 = parseFloat(bicarb);
  const anionGap = na && cl ? parseFloat(na) - parseFloat(cl) - hco3 : null;
  const severity = pH < 7.1 ? 'severe' : pH < 7.25 ? 'moderate' : 'mild';

  const steps = calculated ? [
    {
      title: 'Calculate Anion Gap',
      description: anionGap ? `AG = ${anionGap.toFixed(1)} mEq/L` : 'Need Na, Cl values',
      priority: severity === 'severe' ? 'critical' : 'important',
      content: anionGap ? 
        anionGap > 16 ? 
          `HIGH ANION GAP (${anionGap.toFixed(1)})\nCauses: Lactic acidosis, DKA, uremia, toxins (MUDPILES)` :
          `NORMAL ANION GAP (${anionGap.toFixed(1)})\nCauses: Diarrhea, RTA, hyperalimentation` :
        'Calculate anion gap: Na - Cl - HCO3',
      inlineCalculator: {
        type: 'dose',
        label: 'Bicarbonate Replacement (if pH <7.1)',
        fields: [
          { name: 'weight', label: 'Weight (kg)', placeholder: weight }
        ],
        dosePerKg: (15 - hco3) * 0.5,
        unit: 'mEq NaHCO3'
      },
      branchOn: (data) => anionGap && anionGap > 16 ? 'High AG pathway' : 'Normal AG pathway'
    },
    {
      title: severity === 'severe' ? 'URGENT: Bicarbonate Therapy' : 'Identify & Treat Underlying Cause',
      content: pH < 7.1 ? 
        `SEVERE ACIDOSIS (pH ${ph}):
• NaHCO3 bolus: ${((15 - hco3) * parseFloat(weight) * 0.5).toFixed(0)} mEq IV over 1 hour
• Target: HCO3 15-18 mEq/L (NOT full correction)
• Recheck blood gas in 1 hour
• Risk: Overshoot alkalosis, hypokalemia, tetany` :
        anionGap && anionGap > 16 ?
          `HIGH AG: Treat underlying cause
• Lactic acidosis: Improve perfusion, fluids, pressors
• DKA: Insulin, fluids per protocol
• Uremia: Initiate dialysis if severe
• Toxins: Specific antidotes` :
          `NORMAL AG: GI or renal losses
• Diarrhea: Oral/IV rehydration
• RTA: Oral bicarbonate 1-3 mEq/kg/day
• Hyperalimentation: Adjust TPN`,
      priority: 'critical'
    },
    {
      title: 'Monitor & Prevent Complications',
      content: `• Blood gas q2-4h during treatment
• Electrolytes q4h (K+, Ca++, Na+)
• Watch for: Hypokalemia (give K+ with bicarb), tetany (give Ca++)
• Cardiac monitoring if pH <7.2`,
      priority: 'important'
    }
  ] : [];

  return (
    <div className="space-y-6">
      <Alert className="bg-purple-50 border-purple-300">
        <Wind className="w-5 h-5 text-purple-600" />
        <AlertDescription className="text-purple-900">
          <strong>Severe Metabolic Acidosis:</strong> pH &lt;7.2 or HCO3 &lt;10 - Urgent intervention
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader className="bg-slate-50">
          <CardTitle>Blood Gas Parameters</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>pH *</Label>
              <Input
                type="number"
                step="0.01"
                value={ph}
                onChange={(e) => setPh(e.target.value)}
                placeholder="e.g., 7.15"
              />
            </div>
            <div>
              <Label>HCO3 (mEq/L) *</Label>
              <Input
                type="number"
                step="0.1"
                value={bicarb}
                onChange={(e) => setBicarb(e.target.value)}
                placeholder="e.g., 8"
              />
            </div>
            <div>
              <Label>Weight (kg) *</Label>
              <Input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g., 20"
              />
            </div>
            <div>
              <Label>Na (mEq/L)</Label>
              <Input
                type="number"
                value={na}
                onChange={(e) => setNa(e.target.value)}
                placeholder="e.g., 138"
              />
            </div>
            <div>
              <Label>Cl (mEq/L)</Label>
              <Input
                type="number"
                value={cl}
                onChange={(e) => setCl(e.target.value)}
                placeholder="e.g., 105"
              />
            </div>
          </div>
          <Button
            onClick={handleCalculate}
            disabled={!ph || !bicarb || !weight}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            <Calculator className="w-4 h-4 mr-2" />
            Analyze Acidosis
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