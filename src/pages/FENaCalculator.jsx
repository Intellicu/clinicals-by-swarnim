import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import CalculatorShell from "../components/calculators/CalculatorShell";

export default function FENaCalculator() {
  const [serumNa, setSerumNa] = useState("");
  const [urineNa, setUrineNa] = useState("");
  const [serumCr, setSerumCr] = useState("");
  const [urineCr, setUrineCr] = useState("");
  const [results, setResults] = useState(null);

  const handleCalculate = () => {
    if (!serumNa || !urineNa || !serumCr || !urineCr) return;

    const sNa = parseFloat(serumNa);
    const uNa = parseFloat(urineNa);
    const sCr = parseFloat(serumCr);
    const uCr = parseFloat(urineCr);
    // All four must be positive numbers or the formula divides by zero / yields NaN
    if ([sNa, uNa, sCr, uCr].some(v => isNaN(v) || v <= 0)) {
      setResults({
        safetyLevel: "caution",
        calculationTrace: ["Invalid input — all four values must be positive numbers."],
        primaryResults: [{ label: "FENa", value: "—", subtext: "Invalid input" }],
        safetyAlerts: [{ severity: "warning", title: "Invalid input", message: "Serum/urine sodium and creatinine must all be positive numbers." }],
        additionalInfo: [],
      });
      return;
    }

    // FENa = (Urine Na × Serum Cr) / (Serum Na × Urine Cr) × 100
    const fena = ((uNa * sCr) / (sNa * uCr)) * 100;

    const trace = [
      `Formula: FENa = (UNa × SCr) / (SNa × UCr) × 100`,
      `Serum Na: ${sNa} mEq/L`,
      `Urine Na: ${uNa} mEq/L`,
      `Serum Cr: ${sCr} mg/dL`,
      `Urine Cr: ${uCr} mg/dL`,
      `Calculation: (${uNa} × ${sCr}) / (${sNa} × ${uCr}) × 100 = ${fena.toFixed(2)}%`
    ];

    let interpretation = "";
    let category = "";
    let safetyLevel = "safe";
    const alerts = [];

    if (fena < 1) {
      category = "Prerenal AKI";
      interpretation = "FENa <1% suggests prerenal azotemia (volume depletion, decreased effective arterial blood volume). Consider fluid resuscitation.";
      alerts.push({
        severity: "info",
        title: "Prerenal Pattern",
        message: "Low FENa suggests prerenal causes. Assess volume status and hemodynamics."
      });
    } else if (fena < 2) {
      category = "Borderline/Mixed";
      interpretation = "FENa 1-2% is borderline. Consider clinical context, diuretic use, and other indices (FEUrea).";
      safetyLevel = "caution";
    } else {
      category = "Intrinsic/Postrenal AKI";
      interpretation = "FENa >2% suggests intrinsic renal disease (ATN, AIN, glomerulonephritis) or postrenal obstruction.";
      alerts.push({
        severity: "warning",
        title: "Intrinsic Renal Pattern",
        message: "Elevated FENa suggests intrinsic kidney disease or obstruction. Further workup needed."
      });
      safetyLevel = "caution";
    }

    const recommendations = [
      "Clinical Context:",
      "• Prerenal (FENa <1%): Volume depletion, CHF, cirrhosis, sepsis",
      "• Intrinsic (FENa >2%): ATN, AIN, glomerulonephritis, vasculitis",
      "• Postrenal: Obstruction (often FENa >2% after relief)",
      "",
      "Limitations:",
      "• Diuretics falsely elevate FENa (use FEUrea instead)",
      "• CKD may have baseline elevated FENa",
      "• Contrast nephropathy often has low FENa despite ATN",
      "• Neonates normally have FENa 2-5%"
    ];

    setResults({
      safetyLevel,
      calculationTrace: trace,
      primaryResults: [
        {
          label: "FENa",
          value: `${fena.toFixed(2)}%`,
          subtext: category
        }
      ],
      safetyAlerts: alerts.length > 0 ? alerts : undefined,
      additionalInfo: [
        `Interpretation: ${interpretation}`,
        "",
        ...recommendations
      ],
      prescriptionText: `Fractional Excretion of Sodium (FENa):
Result: ${fena.toFixed(2)}%
Category: ${category}

${interpretation}

Inputs:
- Serum Na: ${sNa} mEq/L
- Urine Na: ${uNa} mEq/L
- Serum Cr: ${sCr} mg/dL
- Urine Cr: ${uCr} mg/dL`,
      references: [
        "Steiner RW. Interpreting the fractional excretion of sodium. Am J Med. 1984;77(4):699-702.",
        "Espinel CH. The FENa test. Use in the differential diagnosis of acute renal failure. JAMA. 1976;236(6):579-581.",
        "Zarich S et al. Fractional excretion of sodium. Arch Intern Med. 1985;145(1):108-112."
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
      title="FENa Calculator"
      description="Fractional Excretion of Sodium - Differentiate prerenal vs intrinsic AKI"
      lastReviewed="2025-01-28"
      references="Steiner 1984, Espinel 1976"
      results={results}
      onCopyPrescription={handleCopyPrescription}
    >
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="serumNa" className="text-sm font-semibold text-slate-700">
              Serum Sodium (mEq/L) *
            </Label>
            <Input
              id="serumNa"
              type="number"
              step="0.1"
              value={serumNa}
              onChange={(e) => setSerumNa(e.target.value)}
              placeholder="e.g., 140"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="urineNa" className="text-sm font-semibold text-slate-700">
              Urine Sodium (mEq/L) *
            </Label>
            <Input
              id="urineNa"
              type="number"
              step="0.1"
              value={urineNa}
              onChange={(e) => setUrineNa(e.target.value)}
              placeholder="e.g., 20"
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
          disabled={!serumNa || !urineNa || !serumCr || !urineCr}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 mt-6"
        >
          Calculate FENa
        </Button>
      </div>
    </CalculatorShell>
  );
}