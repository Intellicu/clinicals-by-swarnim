import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import CalculatorShell from "../components/calculators/CalculatorShell";

export default function TTKGCalculator() {
  const [serumK, setSerumK] = useState("");
  const [urineK, setUrineK] = useState("");
  const [serumOsm, setSerumOsm] = useState("");
  const [urineOsm, setUrineOsm] = useState("");
  const [results, setResults] = useState(null);

  const handleCalculate = () => {
    if (!serumK || !urineK || !serumOsm || !urineOsm) return;

    const sK = parseFloat(serumK);
    const uK = parseFloat(urineK);
    const sOsm = parseFloat(serumOsm);
    const uOsm = parseFloat(urineOsm);

    // TTKG = (Urine K / Serum K) / (Urine Osm / Serum Osm)
    const ttkg = (uK / sK) / (uOsm / sOsm);

    const trace = [
      `Formula: TTKG = (UK / SK) / (UOsm / SOsm)`,
      `Serum K: ${sK} mEq/L`,
      `Urine K: ${uK} mEq/L`,
      `Serum Osm: ${sOsm} mOsm/kg`,
      `Urine Osm: ${uOsm} mOsm/kg`,
      `Calculation: (${uK} / ${sK}) / (${uOsm} / ${sOsm}) = ${ttkg.toFixed(2)}`
    ];

    let interpretation = "";
    let category = "";
    let safetyLevel = "safe";
    const alerts = [];

    // Interpretation depends on whether patient is hyperkalemic or hypokalemic
    if (sK > 5.5) {
      // Hyperkalemia
      if (ttkg > 10) {
        category = "Appropriate renal K+ excretion";
        interpretation = "TTKG >10 in hyperkalemia indicates appropriate renal potassium excretion. Consider extrarenal causes (K+ load, transcellular shift) or check for Type 1 RTA.";
        safetyLevel = "safe";
      } else {
        category = "Impaired renal K+ excretion";
        interpretation = "TTKG <10 in hyperkalemia suggests impaired renal potassium excretion. Consider Type 4 RTA, hypoaldosteronism, aldosterone resistance, or tubular dysfunction.";
        alerts.push({
          severity: "warning",
          title: "Impaired K+ Excretion",
          message: "Low TTKG with hyperkalemia suggests Type 4 RTA or hypoaldosteronism. Check renin, aldosterone levels."
        });
        safetyLevel = "caution";
      }
    } else if (sK < 3.5) {
      // Hypokalemia
      if (ttkg < 2) {
        category = "Appropriate renal K+ conservation";
        interpretation = "TTKG <2 in hypokalemia indicates appropriate renal potassium conservation. Consider extrarenal losses (GI, skin) or inadequate intake.";
        safetyLevel = "safe";
      } else {
        category = "Inappropriate renal K+ loss";
        interpretation = "TTKG >2 in hypokalemia suggests inappropriate renal potassium wasting. Consider diuretics, RTA (Type 1 or 2), hypomagnesemia, or mineralocorticoid excess.";
        alerts.push({
          severity: "warning",
          title: "Renal K+ Wasting",
          message: "Elevated TTKG with hypokalemia suggests renal potassium losses. Evaluate for diuretics, RTA, or hyperaldosteronism."
        });
        safetyLevel = "caution";
      }
    } else {
      // Normal K
      category = "Normal serum potassium";
      interpretation = `TTKG ${ttkg.toFixed(2)} with normal serum K (${sK} mEq/L). TTKG is most useful in dyskalemias.`;
    }

    const recommendations = [
      "Clinical Application:",
      "• Hyperkalemia with TTKG <10: Type 4 RTA, hypoaldosteronism",
      "• Hypokalemia with TTKG >2: Renal K+ wasting (diuretics, RTA, hyperaldo)",
      "• Hypokalemia with TTKG <2: Extrarenal losses (GI, skin)",
      "",
      "Validity Criteria:",
      "• Urine osmolality > serum osmolality (concentrated urine)",
      "• Urine sodium >25 mEq/L (adequate distal Na+ delivery)",
      "",
      "Limitations:",
      "• Not validated in children",
      "• Assumes medullary equilibration",
      "• Diuretics affect interpretation",
      "• Controversy about clinical utility"
    ];

    setResults({
      safetyLevel,
      calculationTrace: trace,
      primaryResults: [
        {
          label: "TTKG",
          value: ttkg.toFixed(2),
          subtext: category
        }
      ],
      safetyAlerts: alerts.length > 0 ? alerts : undefined,
      additionalInfo: [
        `Interpretation: ${interpretation}`,
        "",
        ...recommendations
      ],
      prescriptionText: `Transtubular Potassium Gradient (TTKG):
Result: ${ttkg.toFixed(2)}
Category: ${category}

${interpretation}

Inputs:
- Serum K: ${sK} mEq/L
- Urine K: ${uK} mEq/L
- Serum Osm: ${sOsm} mOsm/kg
- Urine Osm: ${uOsm} mOsm/kg`,
      references: [
        "West ML et al. New clinical approach to evaluate disorders of potassium excretion. Miner Electrolyte Metab. 1986;12(4):234-238.",
        "Ethier JH et al. The transtubular potassium concentration in patients with hypokalemia and hyperkalemia. Am J Kidney Dis. 1990;15(4):309-315.",
        "Kamel KS et al. Controversy: The importance of urine anion gap in the evaluation of metabolic acidosis. Contrib Nephrol. 2007;156:99-106."
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
      title="TTKG Calculator"
      description="Transtubular Potassium Gradient - Assess renal K+ handling"
      lastReviewed="2025-01-28"
      references="West 1986, Ethier 1990"
      results={results}
      onCopyPrescription={handleCopyPrescription}
    >
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="serumK" className="text-sm font-semibold text-slate-700">
              Serum Potassium (mEq/L) *
            </Label>
            <Input
              id="serumK"
              type="number"
              step="0.1"
              value={serumK}
              onChange={(e) => setSerumK(e.target.value)}
              placeholder="e.g., 3.0 or 6.0"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="urineK" className="text-sm font-semibold text-slate-700">
              Urine Potassium (mEq/L) *
            </Label>
            <Input
              id="urineK"
              type="number"
              step="0.1"
              value={urineK}
              onChange={(e) => setUrineK(e.target.value)}
              placeholder="e.g., 30"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="serumOsm" className="text-sm font-semibold text-slate-700">
              Serum Osmolality (mOsm/kg) *
            </Label>
            <Input
              id="serumOsm"
              type="number"
              step="1"
              value={serumOsm}
              onChange={(e) => setSerumOsm(e.target.value)}
              placeholder="e.g., 290"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="urineOsm" className="text-sm font-semibold text-slate-700">
              Urine Osmolality (mOsm/kg) *
            </Label>
            <Input
              id="urineOsm"
              type="number"
              step="1"
              value={urineOsm}
              onChange={(e) => setUrineOsm(e.target.value)}
              placeholder="e.g., 600"
              className="mt-1"
            />
          </div>
        </div>

        <Button
          onClick={handleCalculate}
          disabled={!serumK || !urineK || !serumOsm || !urineOsm}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 mt-6"
        >
          Calculate TTKG
        </Button>
      </div>
    </CalculatorShell>
  );
}