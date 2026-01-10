import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, TrendingUp, Activity } from 'lucide-react';

export default function AutoCalculations({ formData, onUpdate }) {
  useEffect(() => {
    calculateAll();
  }, [formData.weight, formData.height, formData.bp_systolic, formData.bp_diastolic, formData.serumCreatinine]);

  const calculateAll = () => {
    const updates = {};

    // BMI calculation
    if (formData.weight && formData.height) {
      const heightM = parseFloat(formData.height) / 100;
      const bmi = parseFloat(formData.weight) / (heightM * heightM);
      updates.bmi = bmi.toFixed(1);

      // BSA (Mosteller)
      const bsa = Math.sqrt((parseFloat(formData.height) * parseFloat(formData.weight)) / 3600);
      updates.bsa = bsa.toFixed(3);
    }

    // Schwartz eGFR
    if (formData.height && formData.serumCreatinine) {
      const k = 0.413; // Schwartz constant for children
      const egfr = (k * parseFloat(formData.height)) / parseFloat(formData.serumCreatinine);
      updates.egfr = egfr.toFixed(1);
      
      // CKD Stage
      if (egfr >= 90) updates.ckdStage = 'G1 (Normal)';
      else if (egfr >= 60) updates.ckdStage = 'G2 (Mild)';
      else if (egfr >= 30) updates.ckdStage = 'G3 (Moderate)';
      else if (egfr >= 15) updates.ckdStage = 'G4 (Severe)';
      else updates.ckdStage = 'G5 (Kidney Failure)';
    }

    if (Object.keys(updates).length > 0) {
      onUpdate(updates);
    }
  };

  const getBPPercentile = () => {
    // Simplified BP percentile logic
    const sys = parseFloat(formData.bp_systolic);
    if (!sys) return null;
    if (sys < 90) return { percentile: '<50th', status: 'Normal', color: 'bg-green-500' };
    if (sys < 120) return { percentile: '50-90th', status: 'Normal', color: 'bg-green-500' };
    if (sys < 130) return { percentile: '90-95th', status: 'Elevated', color: 'bg-amber-500' };
    if (sys < 140) return { percentile: '95-99th', status: 'Stage 1 HTN', color: 'bg-red-500' };
    return { percentile: '>99th', status: 'Stage 2 HTN', color: 'bg-red-700' };
  };

  const bpData = getBPPercentile();

  return (
    <div className="space-y-3">
      {formData.bmi && (
        <Card className="border-2 border-cyan-200 bg-cyan-50">
          <CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-cyan-600" />
              <span className="text-sm font-semibold text-cyan-900">BMI:</span>
            </div>
            <Badge className="bg-cyan-600 text-white">{formData.bmi} kg/m²</Badge>
          </CardContent>
        </Card>
      )}

      {formData.bsa && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-900">BSA:</span>
            </div>
            <Badge className="bg-blue-600 text-white">{formData.bsa} m²</Badge>
          </CardContent>
        </Card>
      )}

      {formData.egfr && (
        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-semibold text-purple-900">eGFR (Schwartz):</span>
              </div>
              <Badge className="bg-purple-600 text-white">{formData.egfr} mL/min/1.73m²</Badge>
            </div>
            <div className="text-xs text-purple-700 font-medium">{formData.ckdStage}</div>
          </CardContent>
        </Card>
      )}

      {bpData && (
        <Card className={`border-2 ${bpData.color === 'bg-green-500' ? 'border-green-200 bg-green-50' : bpData.color === 'bg-amber-500' ? 'border-amber-200 bg-amber-50' : 'border-red-200 bg-red-50'}`}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">BP Status:</span>
              <div className="flex items-center gap-2">
                <Badge className={bpData.color + ' text-white'}>{bpData.status}</Badge>
                <span className="text-xs">({bpData.percentile})</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}