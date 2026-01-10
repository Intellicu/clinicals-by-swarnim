import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import EnhancedInteractiveStep from './EnhancedInteractiveStep';

export default function SBPPathway() {
  const steps = [
    {
      title: 'Recognize Clinical Presentation',
      description: 'Nephrotic syndrome + abdominal symptoms',
      priority: 'critical',
      content: `SUSPECT SBP IF:
• Nephrotic syndrome patient with fever
• Abdominal pain, tenderness, distension
• Vomiting, ileus, altered mental status
• Unexplained clinical deterioration

HIGH RISK: Age <5y, albumin <2 g/dL, prior SBP`
    },
    {
      title: 'Immediate Diagnostic Ascitic Tap',
      description: 'Paracentesis - bedside or U/S guided',
      priority: 'critical',
      content: `ASCITIC FLUID ANALYSIS:
• Cell count & differential (SEND STAT)
• Gram stain, culture (aerobic/anaerobic)
• Protein, albumin, LDH, glucose
• If bloody: also send cytology

POSITIVE IF:
• PMN count >250 cells/mm³ (DIAGNOSTIC)
• Even if culture negative = treat as SBP`
    },
    {
      title: 'Start Empiric Antibiotics IMMEDIATELY',
      description: 'Do NOT wait for culture results',
      priority: 'critical',
      content: `FIRST-LINE (Community-acquired):
• Cefotaxime 50 mg/kg IV q8h (max 2g/dose)
  OR
• Ceftriaxone 50-75 mg/kg IV q24h (max 2g/dose)

ALTERNATIVE (β-lactam allergy):
• Ciprofloxacin 10 mg/kg IV q12h

DURATION: 7-10 days minimum`
    },
    {
      title: 'Albumin Replacement',
      description: 'Prevent hepatorenal syndrome equivalent',
      priority: 'important',
      content: `• 20% Albumin 1 g/kg IV over 4 hours on Day 1
• Repeat 0.5-1 g/kg on Day 3
• Monitor: BP, UOP, renal function`
    },
    {
      title: 'Monitor Response',
      content: `• Repeat ascitic tap at 48h if no clinical improvement
• Follow PMN count (should decrease >50%)
• Blood cultures if persistent fever
• Watch for complications: AKI, respiratory distress`,
      priority: 'important'
    }
  ];

  return (
    <div className="space-y-6">
      <Alert className="bg-red-50 border-red-300 border-2">
        <AlertTriangle className="w-5 h-5 text-red-600" />
        <AlertDescription className="text-red-900">
          <strong>Spontaneous Bacterial Peritonitis (SBP):</strong> Life-threatening infection in nephrotic ascites. Immediate antibiotics save lives.
        </AlertDescription>
      </Alert>

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

      <Card className="bg-slate-50">
        <CardHeader>
          <CardTitle className="text-base">References</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-slate-700">
          <p>IPNA Nephrotic Syndrome Guidelines 2024, KDIGO Practice Points 2021</p>
        </CardContent>
      </Card>
    </div>
  );
}