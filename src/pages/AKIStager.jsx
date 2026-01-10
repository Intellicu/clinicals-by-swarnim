import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import CalculatorShell from "../components/calculators/CalculatorShell";

export default function AKIStager() {
  const [baselineCr, setBaselineCr] = useState("");
  const [currentCr, setCurrentCr] = useState("");
  const [weight, setWeight] = useState("");
  const [urineOutput6h, setUrineOutput6h] = useState("");
  const [urineOutput12h, setUrineOutput12h] = useState("");
  const [urineOutput24h, setUrineOutput24h] = useState("");
  const [rrtInitiated, setRrtInitiated] = useState(false);
  const [results, setResults] = useState(null);

  const handleCalculate = () => {
    if (!currentCr) return;

    const currentCreat = parseFloat(currentCr);
    const baseCreat = baselineCr ? parseFloat(baselineCr) : null;
    const wt = weight ? parseFloat(weight) : null;

    let stage = 0;
    let criteriaMet = [];
    const trace = [`Current SCr: ${currentCreat} mg/dL`];

    if (baseCreat) {
      trace.push(`Baseline SCr: ${baseCreat} mg/dL`);
      const deltaCr = currentCreat - baseCreat;
      const ratio = currentCreat / baseCreat;
      
      trace.push(`ΔCr: ${deltaCr.toFixed(2)} mg/dL`);
      trace.push(`Cr ratio: ${ratio.toFixed(2)}x baseline`);

      // KDIGO Criteria - Creatinine
      if (deltaCr >= 0.3 || ratio >= 1.5) {
        stage = Math.max(stage, 1);
        criteriaMet.push("Stage 1: ΔCr ≥0.3 mg/dL or 1.5-1.9x baseline");
      }
      if (ratio >= 2.0) {
        stage = Math.max(stage, 2);
        criteriaMet.push("Stage 2: Cr 2.0-2.9x baseline");
      }
      if (ratio >= 3.0) {
        stage = Math.max(stage, 3);
        criteriaMet.push("Stage 3: Cr ≥3.0x baseline or ≥4.0 mg/dL");
      }
      if (currentCreat >= 4.0) {
        stage = Math.max(stage, 3);
        criteriaMet.push("Stage 3: SCr ≥4.0 mg/dL");
      }
    } else {
      trace.push("Baseline SCr not provided - using absolute criteria only");
      if (currentCreat >= 4.0) {
        stage = Math.max(stage, 3);
        criteriaMet.push("Stage 3: SCr ≥4.0 mg/dL (absolute)");
      }
    }

    // Urine output criteria
    if (wt) {
      trace.push(`Weight: ${wt} kg`);
      
      if (urineOutput6h) {
        const uo6 = parseFloat(urineOutput6h);
        const uoPerKgHr = uo6 / wt / 6;
        trace.push(`UO 6h: ${uo6} mL → ${uoPerKgHr.toFixed(2)} mL/kg/hr`);
        if (uoPerKgHr < 0.5) {
          stage = Math.max(stage, 1);
          criteriaMet.push(`Stage 1: UO <0.5 mL/kg/hr for 6h (${uoPerKgHr.toFixed(2)})`);
        }
      }

      if (urineOutput12h) {
        const uo12 = parseFloat(urineOutput12h);
        const uoPerKgHr = uo12 / wt / 12;
        trace.push(`UO 12h: ${uo12} mL → ${uoPerKgHr.toFixed(2)} mL/kg/hr`);
        if (uoPerKgHr < 0.5) {
          stage = Math.max(stage, 2);
          criteriaMet.push(`Stage 2: UO <0.5 mL/kg/hr for ≥12h (${uoPerKgHr.toFixed(2)})`);
        }
      }

      if (urineOutput24h) {
        const uo24 = parseFloat(urineOutput24h);
        const uoPerKgHr = uo24 / wt / 24;
        trace.push(`UO 24h: ${uo24} mL → ${uoPerKgHr.toFixed(2)} mL/kg/hr`);
        if (uoPerKgHr < 0.3) {
          stage = Math.max(stage, 3);
          criteriaMet.push(`Stage 3: UO <0.3 mL/kg/hr for ≥24h or anuria (${uoPerKgHr.toFixed(2)})`);
        }
      }
    }

    if (rrtInitiated) {
      stage = Math.max(stage, 3);
      criteriaMet.push("Stage 3: RRT initiated");
    }

    trace.push(`\nFinal AKI Stage: ${stage === 0 ? 'No AKI' : stage}`);

    const recommendations = [];
    if (stage === 0) {
      recommendations.push("No AKI criteria met");
      recommendations.push("Continue routine monitoring");
    } else if (stage === 1) {
      recommendations.push("Monitor: SCr and UO every 6-12 hours");
      recommendations.push("Optimize hemodynamics and volume status");
      recommendations.push("Review and stop nephrotoxins");
      recommendations.push("Avoid contrast agents if possible");
    } else if (stage === 2) {
      recommendations.push("Monitor: SCr and UO every 4-6 hours");
      recommendations.push("Nephrology consultation recommended");
      recommendations.push("Aggressive fluid management");
      recommendations.push("Daily electrolytes (K, PO4, Mg)");
      recommendations.push("Consider cause: prerenal, intrinsic, postrenal");
    } else {
      recommendations.push("URGENT: Intensive monitoring required");
      recommendations.push("Nephrology consultation STAT");
      recommendations.push("Monitor: SCr, K, acidosis every 4-6 hours");
      recommendations.push("Assess for RRT indications (AEIOU):");
      recommendations.push("  • Acidosis (metabolic, refractory)");
      recommendations.push("  • Electrolytes (hyperkalemia >6.5)");
      recommendations.push("  • Ingestion/Intoxication (dialyzable)");
      recommendations.push("  • Overload (fluid, refractory pulmonary edema)");
      recommendations.push("  • Uremia (encephalopathy, pericarditis)");
    }

    const alerts = [];
    if (stage === 3) {
      alerts.push({
        severity: "critical",
        title: "Severe AKI (Stage 3)",
        message: "Urgent nephrology consultation. Assess for RRT indications. Monitor closely for life-threatening complications."
      });
    } else if (stage === 2) {
      alerts.push({
        severity: "warning",
        title: "Moderate AKI (Stage 2)",
        message: "Nephrology consultation recommended. Intensive monitoring and supportive care required."
      });
    } else if (stage === 1) {
      alerts.push({
        severity: "warning",
        title: "Mild AKI (Stage 1)",
        message: "Monitor kidney function closely. Optimize hemodynamics and review medications."
      });
    }

    const safetyLevel = stage === 3 ? "critical" : stage > 0 ? "caution" : "safe";

    setResults({
      safetyLevel,
      calculationTrace: trace,
      primaryResults: [
        {
          label: "AKI Stage (KDIGO)",
          value: stage === 0 ? "No AKI" : `Stage ${stage}`,
          subtext: criteriaMet.length > 0 ? `${criteriaMet.length} criteria met` : "No criteria met"
        }
      ],
      safetyAlerts: alerts.length > 0 ? alerts : undefined,
      additionalInfo: [
        "Criteria Met:",
        ...criteriaMet,
        "",
        "Management Recommendations:",
        ...recommendations
      ],
      prescriptionText: `AKI Assessment (KDIGO):
Stage: ${stage === 0 ? 'No AKI' : stage}
Current SCr: ${currentCreat} mg/dL
${baseCreat ? `Baseline SCr: ${baseCreat} mg/dL` : ''}
${wt ? `Weight: ${wt} kg` : ''}

Criteria:
${criteriaMet.length > 0 ? criteriaMet.map((c, i) => `${i + 1}. ${c}`).join('\n') : 'None met'}

Action Plan:
${recommendations.join('\n')}`,
      references: [
        "KDIGO Clinical Practice Guideline for Acute Kidney Injury. Kidney Int Suppl. 2012;2(1):1-138.",
        "Kellum JA, Lameire N. Diagnosis, evaluation, and management of acute kidney injury: a KDIGO summary. Crit Care. 2013;17(1):204."
      ]
    });
  };

  const handleCopyPrescription = async () => {
    if (results?.prescriptionText) {
      await navigator.clipboard.writeText(results.prescriptionText);
    }
  };

  return (
    <CalculatorShell
      title="AKI KDIGO Stager"
      description="Classify acute kidney injury severity using KDIGO criteria"
      lastReviewed="2025-01-28"
      references="KDIGO 2012"
      results={results}
      onCopyPrescription={handleCopyPrescription}
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="currentCr" className="text-sm font-semibold text-slate-700">
            Current Serum Creatinine (mg/dL) *
          </Label>
          <Input
            id="currentCr"
            type="number"
            step="0.01"
            value={currentCr}
            onChange={(e) => setCurrentCr(e.target.value)}
            placeholder="e.g., 1.2"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="baselineCr" className="text-sm font-semibold text-slate-700">
            Baseline Serum Creatinine (mg/dL)
          </Label>
          <Input
            id="baselineCr"
            type="number"
            step="0.01"
            value={baselineCr}
            onChange={(e) => setBaselineCr(e.target.value)}
            placeholder="Known baseline or lowest recent"
            className="mt-1"
          />
          <p className="text-xs text-slate-500 mt-1">Within past 7 days or lowest value within 48h</p>
        </div>

        <div>
          <Label htmlFor="weight" className="text-sm font-semibold text-slate-700">
            Weight (kg)
          </Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="For urine output criteria"
            className="mt-1"
          />
        </div>

        <div className="border-t pt-4">
          <Label className="text-sm font-semibold text-slate-700 mb-2 block">
            Urine Output (mL)
          </Label>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="uo6h" className="text-xs text-slate-600">
                6-hour total
              </Label>
              <Input
                id="uo6h"
                type="number"
                value={urineOutput6h}
                onChange={(e) => setUrineOutput6h(e.target.value)}
                placeholder="Optional"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="uo12h" className="text-xs text-slate-600">
                12-hour total
              </Label>
              <Input
                id="uo12h"
                type="number"
                value={urineOutput12h}
                onChange={(e) => setUrineOutput12h(e.target.value)}
                placeholder="Optional"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="uo24h" className="text-xs text-slate-600">
                24-hour total
              </Label>
              <Input
                id="uo24h"
                type="number"
                value={urineOutput24h}
                onChange={(e) => setUrineOutput24h(e.target.value)}
                placeholder="Optional"
                className="mt-1"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <Checkbox
            id="rrt"
            checked={rrtInitiated}
            onCheckedChange={setRrtInitiated}
          />
          <label htmlFor="rrt" className="text-sm text-slate-700 cursor-pointer">
            RRT initiated
          </label>
        </div>

        <Button
          onClick={handleCalculate}
          disabled={!currentCr}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 mt-6"
        >
          Calculate AKI Stage
        </Button>
      </div>
    </CalculatorShell>
  );
}