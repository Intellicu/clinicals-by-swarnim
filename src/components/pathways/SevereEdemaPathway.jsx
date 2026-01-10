import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Droplet, Calculator } from 'lucide-react';
import EnhancedInteractiveStep from './EnhancedInteractiveStep';

export default function SevereEdemaPathway() {
  const [albumin, setAlbumin] = useState('');
  const [weight, setWeight] = useState('');
  const [uop, setUOP] = useState('');
  const [calculated, setCalculated] = useState(false);

  const alb = parseFloat(albumin);
  const wt = parseFloat(weight);
  const severity = alb < 1.5 ? 'critical' : alb < 2.0 ? 'severe' : 'moderate';

  const steps = calculated ? [
    {
      title: 'Assess Fluid Status & Albumin',
      description: `Albumin: ${albumin} g/dL - ${severity.toUpperCase()}`,
      priority: severity === 'critical' ? 'critical' : 'important',
      content: `Severe hypoalbuminemia (${albumin} g/dL). Risk of intravascular depletion despite edema.
      
DO NOT give aggressive diuretics without albumin if <2.0 g/dL - risk of shock.`,
      inlineCalculator: alb < 2.5 ? {
        type: 'dose',
        label: 'Albumin Infusion Calculator',
        fields: [
          { name: 'weight', label: 'Weight (kg)', placeholder: weight }
        ],
        dosePerKg: 1,
        unit: 'g (20% albumin)'
      } : null
    },
    {
      title: 'Diuretic Protocol',
      content: alb < 2.0 ? 
        `COMBINED THERAPY (Albumin + Diuretic):
• 20% Albumin 1 g/kg IV over 2-4 hours
• THEN Furosemide 1-2 mg/kg IV 30 min after albumin
• Monitor: BP q15min, UOP hourly, strict I&O
• Target: UOP >2 mL/kg/hr for 4-6 hours` :
        `DIURETIC MONOTHERAPY:
• Furosemide 1-2 mg/kg IV/PO
• If inadequate response: Double dose q6h (max 6 mg/kg/dose)
• Consider adding spironolactone 2 mg/kg/day`,
      priority: 'critical'
    },
    {
      title: 'Monitor Response',
      content: `• Strict I&O charting
• Daily weight (same time, same scale)
• Electrolytes (K+, Na+) q6-12h
• Renal function (BUN, Cr) daily
• Watch for: Hypotension, hypovolemia, AKI`,
      priority: 'important'
    }
  ] : [];

  return (
    <div className="space-y-6">
      <Alert className="bg-cyan-50 border-cyan-300">
        <Droplet className="w-5 h-5 text-cyan-600" />
        <AlertDescription className="text-cyan-900">
          <strong>Severe Edema in Nephrotic Syndrome:</strong> Careful fluid management - avoid hypovolemia
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader className="bg-slate-50">
          <CardTitle>Patient Assessment</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Serum Albumin (g/dL) *</Label>
              <Input
                type="number"
                step="0.1"
                value={albumin}
                onChange={(e) => setAlbumin(e.target.value)}
                placeholder="e.g., 1.8"
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
              <Label>Urine Output (mL/kg/hr)</Label>
              <Input
                type="number"
                step="0.1"
                value={uop}
                onChange={(e) => setUOP(e.target.value)}
                placeholder="e.g., 0.5"
              />
            </div>
          </div>
          <Button
            onClick={() => setCalculated(true)}
            disabled={!albumin || !weight}
            className="w-full bg-cyan-600 hover:bg-cyan-700"
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