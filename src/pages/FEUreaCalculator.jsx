import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import CalculatorShell from "../components/calculators/CalculatorShell";

export default function FEUreaCalculator() {
  const [serumUrea, setSerumUrea] = useState("");
  const [urineUrea, setUrineUrea] = useState("");
  const [serumCr, setSerumCr] = useState("");
  const [urineCr, setUrineCr] = useState("");
  const [results, setResults] = useState(null);

  const handleCalculate = () => {
    if (!serumUrea || !urineUrea || !serumCr || !urineCr) return;

    const sUrea = parseFloat(serumUrea);
    const uUrea = parseFloat(urineUrea);
    const sCr = parseFloat(serumCr);
    const uCr = parseFloat(urineCr);

    // FEUrea = (Urine Urea × Serum Cr) / (Serum Urea × Urine Cr) × 100
    const feurea = ((uUrea * sCr) / (sUrea * uCr)) * 100;

    const trace = [
      `Formula: FEUrea = (UUrea × SCr) / (SUrea × UCr) × 100`,
      `Serum Urea: ${sUrea} mg/dL`,
      `Urine Urea: ${uUrea} mg/dL`,
      `Serum Cr: ${sCr} mg/dL`,
      `Urine Cr: ${uCr} mg/dL`,
      `Calculation: (${uUrea} × ${sCr}) / (${sUrea} × ${uCr}) × 100 = ${feurea.toFixed(2)}%`
    ];

    let interpretation = "";
    let category = "";
    let safetyLevel = "safe";
    const alerts = [];

    if (feurea < 35) {
      category = "Prerenal AKI";
      interpretation = "FEUrea <35% suggests prerenal azotemia. Particularly useful when diuretics have been given (unlike FENa).";
      alerts.push({
        severity: "info",
        title: "Prerenal Pattern",
        message: "Low FEUrea suggests prerenal causes. FEUrea is reliable even with diuretic use."
      });
    } else if (feurea < 50) {
      category = "Borderline/Mixed";
      interpretation = "FEUrea 35-50% is borderline. Consider clinical context and other markers.";
      safetyLevel = "caution";
    } else {
      category = "Intrinsic/Postrenal AKI";
      interpretation = "FEUrea >50% suggests intrinsic renal disease (ATN, AIN, glomerulonephritis) or postrenal obstruction.";
      alerts.push({
        severity: "warning",
        title: "Intrinsic Renal Pattern",
        message: "Elevated FEUrea suggests intrinsic kidney disease. Further evaluation needed."
      });
      safetyLevel = "caution";
    }

    const recommendations = [
      "Clinical Context:",
      "• Prerenal (FEUrea <35%): Volume depletion, heart failure, cirrhosis",
      "• Intrinsic (FEUrea >50%): ATN, AIN, glomerulonephritis",
      "",
      "Advantages over FENa:",
      "• Not affected by diuretics (urea reabsorption is passive)",
      "• More reliable in chronic diuretic use",
      "• Better for patients on loop or thiazide diuretics",
      "",
      "Limitations:",
      "• Less well-validated than FENa in some populations",
      "• Variable reabsorption with protein intake changes",
      "• May be less accurate in severe volume depletion"
    ];

    setResults({
      safetyLevel,
      calculationTrace: trace,
      primaryResults: [
        {
          label: "FEUrea",
          value: `${feurea.toFixed(2)}%`,
          subtext: category
        }
      ],
      safetyAlerts: alerts.length > 0 ? alerts : undefined,
      additionalInfo: [
        `Interpretation: ${interpretation}`,
        "",
        ...recommendations
      ],
      prescriptionText: `Fractional Excretion of Urea (FEUrea):
Result: ${feurea.toFixed(2)}%
Category: ${category}

${interpretation}

Inputs:
- Serum Urea: ${sUrea} mg/dL
- Urine Urea: ${uUrea} mg/dL
- Serum Cr: ${sCr} mg/dL
- Urine Cr: ${uCr} mg/dL`,
      references: [
        "Carvounis CP et al. Significance of the fractional excretion of urea in the differential diagnosis of acute renal failure. Kidney Int. 2002;62(6):2223-2229.",
        "Diskin CJ et al. Towards a better understanding of the fractional excretion of urea. Clin Nephrol. 2010;73(6):425-432."
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
      title="FEUrea Calculator"
      description="Fractional Excretion of Urea - Useful when diuretics have been given"
      lastReviewed="2025-01-28"
      references="Carvounis 2002"
      results={results}
      onCopyPrescription={handleCopyPrescription}
    >
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="serumUrea" className="text-sm font-semibold text-slate-700">
              Serum Urea (BUN) (mg/dL) *
            </Label>
            <Input
              id="serumUrea"
              type="number"
              step="0.1"
              value={serumUrea}
              onChange={(e) => setSerumUrea(e.target.value)}
              placeholder="e.g., 40"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="urineUrea" className="text-sm font-semibold text-slate-700">
              Urine Urea (mg/dL) *
            </Label>
            <Input
              id="urineUrea"
              type="number"
              step="0.1"
              value={urineUrea}
              onChange={(e) => setUrineUrea(e.target.value)}
              placeholder="e.g., 300"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="serumCr" className="text-sm font-semibold text-slate-700">
              Serum Creatinine (mg/dL) *
            </Label>
            <Input
              id="serumCr"
              type="number"
              step="0.01"
              value={serumCr}
              onChange={(e) => setSerumCr(e.target.value)}
              placeholder="e.g., 1.2"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="urineCr" className="text-sm font-semibold text-slate-700">
              Urine Creatinine (mg/dL) *
            </Label>
            <Input
              id="urineCr"
              type="number"
              step="0.1"
              value={urineCr}
              onChange={(e) => setUrineCr(e.target.value)}
              placeholder="e.g., 80"
              className="mt-1"
            />
          </div>
        </div>

        <Button
          onClick={handleCalculate}
          disabled={!serumUrea || !urineUrea || !serumCr || !urineCr}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 mt-6"
        >
          Calculate FEUrea
        </Button>
      </div>
    </CalculatorShell>
  );
}