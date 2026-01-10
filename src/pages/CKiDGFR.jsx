import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CalculatorShell from "../components/calculators/CalculatorShell";

export default function CKiDGFR() {
  const [height, setHeight] = useState("");
  const [creatinine, setCreatinine] = useState("");
  const [cystatinC, setCystatinC] = useState("");
  const [bun, setBun] = useState("");
  const [sex, setSex] = useState("male");
  const [results, setResults] = useState(null);

  const handleCalculate = () => {
    if (!height || !creatinine) return;

    const heightCm = parseFloat(height);
    const crMgDl = parseFloat(creatinine);
    const cysCmgL = cystatinC ? parseFloat(cystatinC) : null;
    const bunMgDl = bun ? parseFloat(bun) : null;

    let eGFR;
    let formulaUsed = "";
    const trace = [];

    if (cysCmgL) {
      // CKiD formula with cystatin C (most accurate)
      // eGFR = 39.8 × [height(m) / SCr]^0.456 × [1.8 / Cys C]^0.418 × [30 / BUN]^0.079 × [1.076]^male × [height(m) / 1.4]^0.179
      const heightM = heightCm / 100;
      const k1 = 39.8;
      const term1 = Math.pow(heightM / crMgDl, 0.456);
      const term2 = Math.pow(1.8 / cysCmgL, 0.418);
      const term3 = bunMgDl ? Math.pow(30 / bunMgDl, 0.079) : 1;
      const term4 = sex === "male" ? 1.076 : 1;
      const term5 = Math.pow(heightM / 1.4, 0.179);
      
      eGFR = k1 * term1 * term2 * term3 * term4 * term5;
      formulaUsed = "CKiD 2012 (with Cystatin C)";
      
      trace.push(`Formula: ${formulaUsed}`);
      trace.push(`Height: ${heightCm} cm (${heightM.toFixed(2)} m)`);
      trace.push(`Serum Creatinine: ${crMgDl} mg/dL`);
      trace.push(`Cystatin C: ${cysCmgL} mg/L`);
      if (bunMgDl) trace.push(`BUN: ${bunMgDl} mg/dL`);
      trace.push(`Sex: ${sex}`);
      trace.push(`Calculation: 39.8 × multiple factors = ${eGFR.toFixed(1)} mL/min/1.73m²`);
    } else {
      // CKiD formula without cystatin C
      // eGFR = 39.1 × [height(m) / SCr]^0.516 × [1.8 / Cys C]^0.294 × [30 / BUN]^0.169 × [1.099]^male × [height(m) / 1.4]^0.188
      // Without Cys C, simplified version (Schwartz-based CKiD):
      // eGFR = 41.3 × [height(m) / SCr]^0.516 × [1.099]^male × [height(m) / 1.4]^0.188
      const heightM = heightCm / 100;
      const k1 = 41.3;
      const term1 = Math.pow(heightM / crMgDl, 0.516);
      const term2 = sex === "male" ? 1.099 : 1;
      const term3 = Math.pow(heightM / 1.4, 0.188);
      
      eGFR = k1 * term1 * term2 * term3;
      formulaUsed = "CKiD 2009 (without Cystatin C)";
      
      trace.push(`Formula: ${formulaUsed}`);
      trace.push(`Height: ${heightCm} cm (${heightM.toFixed(2)} m)`);
      trace.push(`Serum Creatinine: ${crMgDl} mg/dL`);
      trace.push(`Sex: ${sex}`);
      trace.push(`Calculation: 41.3 × factors = ${eGFR.toFixed(1)} mL/min/1.73m²`);
    }

    let stage = "";
    let stageColor = "safe";
    if (eGFR >= 90) {
      stage = "G1 (Normal/High)";
      stageColor = "safe";
    } else if (eGFR >= 60) {
      stage = "G2 (Mild decrease)";
      stageColor = "safe";
    } else if (eGFR >= 30) {
      stage = "G3 (Moderate decrease)";
      stageColor = "caution";
    } else if (eGFR >= 15) {
      stage = "G4 (Severe decrease)";
      stageColor = "critical";
    } else {
      stage = "G5 (Kidney failure)";
      stageColor = "critical";
    }

    const alerts = [];
    if (eGFR < 60) {
      alerts.push({
        severity: eGFR < 30 ? "critical" : "warning",
        title: "Reduced Kidney Function",
        message: `eGFR indicates ${stage}. Consider CKD staging and nephrology referral.`
      });
    }

    if (!cysCmgL) {
      alerts.push({
        severity: "info",
        title: "Enhanced Accuracy Available",
        message: "Add Cystatin C for more accurate CKiD formula (especially useful in extremes of muscle mass)."
      });
    }

    setResults({
      safetyLevel: stageColor,
      calculationTrace: trace,
      primaryResults: [
        {
          label: "eGFR (CKiD)",
          value: `${eGFR.toFixed(1)} mL/min/1.73m²`,
          subtext: stage
        }
      ],
      safetyAlerts: alerts.length > 0 ? alerts : undefined,
      additionalInfo: [
        "CKiD equations developed from pediatric CKD cohort",
        "More accurate than Schwartz in children with CKD",
        "Cystatin C-based formula recommended for greatest precision",
        "Valid for ages 1-18 years",
        "Less influenced by muscle mass than creatinine alone"
      ],
      prescriptionText: `eGFR (CKiD): ${eGFR.toFixed(1)} mL/min/1.73m²
CKD Stage: ${stage}
Formula: ${formulaUsed}
Height: ${heightCm} cm
Creatinine: ${crMgDl} mg/dL
${cysCmgL ? `Cystatin C: ${cysCmgL} mg/L` : ''}
Sex: ${sex}`,
      references: [
        "Schwartz GJ et al. New equations to estimate GFR in children with CKD. J Am Soc Nephrol. 2009;20(3):629-637.",
        "Schwartz GJ et al. Improved equations estimating GFR in children with chronic kidney disease using an immunonephelometric determination of cystatin C. Kidney Int. 2012;82(4):445-453.",
        "KDIGO CKD Guidelines 2024"
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
      title="CKiD GFR Calculator"
      description="Advanced pediatric eGFR using CKiD equations (with optional Cystatin C)"
      lastReviewed="2025-01-28"
      references="Schwartz 2009/2012, KDIGO 2024"
      results={results}
      onCopyPrescription={handleCopyPrescription}
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="height" className="text-sm font-semibold text-slate-700">
            Height (cm) *
          </Label>
          <Input
            id="height"
            type="number"
            step="0.1"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="e.g., 120"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="creatinine" className="text-sm font-semibold text-slate-700">
            Serum Creatinine (mg/dL) *
          </Label>
          <Input
            id="creatinine"
            type="number"
            step="0.01"
            value={creatinine}
            onChange={(e) => setCreatinine(e.target.value)}
            placeholder="e.g., 0.5"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="cystatinC" className="text-sm font-semibold text-slate-700">
            Cystatin C (mg/L)
          </Label>
          <Input
            id="cystatinC"
            type="number"
            step="0.01"
            value={cystatinC}
            onChange={(e) => setCystatinC(e.target.value)}
            placeholder="Optional - improves accuracy"
            className="mt-1"
          />
          <p className="text-xs text-slate-500 mt-1">Recommended for best accuracy</p>
        </div>

        <div>
          <Label htmlFor="bun" className="text-sm font-semibold text-slate-700">
            BUN (mg/dL)
          </Label>
          <Input
            id="bun"
            type="number"
            step="0.1"
            value={bun}
            onChange={(e) => setBun(e.target.value)}
            placeholder="Optional"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="sex" className="text-sm font-semibold text-slate-700">
            Sex *
          </Label>
          <Select value={sex} onValueChange={setSex}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleCalculate}
          disabled={!height || !creatinine}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 mt-6"
        >
          Calculate eGFR
        </Button>
      </div>
    </CalculatorShell>
  );
}