import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import CalculatorShell from "../components/calculators/CalculatorShell";
import { ArrowLeft } from "lucide-react";

export default function AnionGap() {
  const [sodium, setSodium] = useState("");
  const [chloride, setChloride] = useState("");
  const [bicarbonate, setBicarbonate] = useState("");
  const [albumin, setAlbumin] = useState("");
  const [results, setResults] = useState(null);

  const handleCalculate = () => {
    if (!sodium || !chloride || !bicarbonate) return;

    const na = parseFloat(sodium);
    const cl = parseFloat(chloride);
    const hco3 = parseFloat(bicarbonate);
    const alb = albumin ? parseFloat(albumin) : null;

    const ag = na - (cl + hco3);
    let correctedAG = ag;
    if (alb !== null && alb < 4) {
      const albCorrection = 2.5 * (4 - alb);
      correctedAG = ag + albCorrection;
    }

    const normalAG = 12;
    const deltaGap = ag - normalAG;
    const deltaRatio = hco3 + deltaGap;

    const trace = [
      `Na: ${na} mEq/L`,
      `Cl: ${cl} mEq/L`,
      `HCO3: ${hco3} mEq/L`,
      `Anion Gap = ${na} - (${cl} + ${hco3}) = ${ag.toFixed(1)} mEq/L`
    ];

    if (alb !== null) {
      trace.push(`Albumin: ${alb} g/dL`);
      if (alb < 4) {
        trace.push(`Albumin correction: +${(2.5 * (4 - alb)).toFixed(1)} mEq/L`);
        trace.push(`Corrected AG: ${correctedAG.toFixed(1)} mEq/L`);
      }
    }

    trace.push(`Delta Gap: ${deltaGap.toFixed(1)} (AG - 12)`);
    trace.push(`Delta Ratio: HCO3 + ΔGap = ${deltaRatio.toFixed(1)}`);

    let agInterpretation = "";
    let safetyLevel = "safe";
    const alerts = [];

    if (correctedAG > 20) {
      agInterpretation = "High Anion Gap (>20)";
      safetyLevel = "critical";
      alerts.push({
        severity: "critical",
        title: "High Anion Gap Metabolic Acidosis",
        message: "MUDPILES causes: Methanol, Uremia, DKA, Propylene glycol, Iron/INH, Lactic acidosis, Ethylene glycol, Salicylates"
      });
    } else if (correctedAG > 16) {
      agInterpretation = "Elevated Anion Gap (16-20)";
      safetyLevel = "caution";
      alerts.push({
        severity: "warning",
        title: "Elevated Anion Gap",
        message: "Mild elevation. Consider early metabolic acidosis or measurement variability."
      });
    } else if (correctedAG >= 8) {
      agInterpretation = "Normal Anion Gap (8-16)";
      safetyLevel = "safe";
    } else {
      agInterpretation = "Low Anion Gap (<8)";
      safetyLevel = "caution";
      alerts.push({
        severity: "info",
        title: "Low Anion Gap",
        message: "Consider: hypoalbuminemia, hypercalcemia, lithium, bromism, or lab error."
      });
    }

    let mixedDisorder = "";
    if (deltaGap > 6) {
      if (deltaRatio < 20) {
        mixedDisorder = "Mixed: High AG acidosis + Non-AG acidosis";
      } else if (deltaRatio > 30) {
        mixedDisorder = "Mixed: High AG acidosis + Metabolic alkalosis";
      } else {
        mixedDisorder = "Pure high AG metabolic acidosis";
      }
    }

    const recommendations = [];
    if (ag > 16) {
      recommendations.push("Workup for High AG Acidosis:");
      recommendations.push("• Lactate level");
      recommendations.push("• Glucose, BUN, creatinine");
      recommendations.push("• Ketones (serum β-hydroxybutyrate)");
      recommendations.push("• Toxicology screen if indicated");
      recommendations.push("• Osmolar gap");
      if (mixedDisorder) {
        recommendations.push("");
        recommendations.push(`Delta gap suggests: ${mixedDisorder}`);
      }
    }

    setResults({
      safetyLevel,
      calculationTrace: trace,
      primaryResults: [
        {
          label: "Anion Gap",
          value: `${ag.toFixed(1)} mEq/L`,
          subtext: agInterpretation
        },
        ...(alb !== null && alb < 4 ? [{
          label: "Corrected AG",
          value: `${correctedAG.toFixed(1)} mEq/L`,
          subtext: "Albumin-adjusted"
        }] : []),
        {
          label: "Delta Gap",
          value: `${deltaGap.toFixed(1)}`,
          subtext: mixedDisorder || "For mixed disorders"
        }
      ],
      safetyAlerts: alerts.length > 0 ? alerts : undefined,
      additionalInfo: [
        "Normal Anion Gap: 8-16 mEq/L",
        "Albumin correction: For every 1 g/dL ↓ in albumin below 4, add 2.5 to AG",
        "",
        ...(recommendations.length > 0 ? recommendations : [
          "Normal anion gap. Consider non-AG causes if acidosis present:",
          "• GI losses (diarrhea)",
          "• Renal tubular acidosis",
          "• Urinary diversions"
        ])
      ],
      prescriptionText: `Anion Gap Analysis:
Na: ${na} mEq/L
Cl: ${cl} mEq/L
HCO3: ${hco3} mEq/L
${alb ? `Albumin: ${alb} g/dL` : ''}

Anion Gap: ${ag.toFixed(1)} mEq/L
${alb && alb < 4 ? `Corrected AG: ${correctedAG.toFixed(1)} mEq/L` : ''}
Delta Gap: ${deltaGap.toFixed(1)}
${mixedDisorder ? `\n${mixedDisorder}` : ''}

Interpretation: ${agInterpretation}`,
      references: [
        "Kraut JA, Madias NE. Serum anion gap: its uses and limitations in clinical medicine. Clin J Am Soc Nephrol. 2007;2(1):162-174.",
        "Emmett M, Narins RG. Clinical use of the anion gap. Medicine (Baltimore). 1977;56(1):38-54."
      ]
    });
  };

  const handleCopyPrescription = async () => {
    if (results?.prescriptionText) {
      await navigator.clipboard.writeText(results.prescriptionText);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <Link to={createPageUrl("Hub")}>
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hub
          </Button>
        </Link>

        <CalculatorShell
          title="Anion Gap Calculator"
          description="Calculate anion gap and delta gap for acid-base assessment"
          lastReviewed="2025-01-28"
          references="Kraut & Madias 2007"
          results={results}
          onCopyPrescription={handleCopyPrescription}
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="sodium" className="text-sm font-semibold text-slate-700">
                Sodium (mEq/L) *
              </Label>
              <Input
                id="sodium"
                type="number"
                step="0.1"
                value={sodium}
                onChange={(e) => setSodium(e.target.value)}
                placeholder="e.g., 140"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="chloride" className="text-sm font-semibold text-slate-700">
                Chloride (mEq/L) *
              </Label>
              <Input
                id="chloride"
                type="number"
                step="0.1"
                value={chloride}
                onChange={(e) => setChloride(e.target.value)}
                placeholder="e.g., 105"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="bicarbonate" className="text-sm font-semibold text-slate-700">
                Bicarbonate (mEq/L) *
              </Label>
              <Input
                id="bicarbonate"
                type="number"
                step="0.1"
                value={bicarbonate}
                onChange={(e) => setBicarbonate(e.target.value)}
                placeholder="e.g., 22"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="albumin" className="text-sm font-semibold text-slate-700">
                Albumin (g/dL)
              </Label>
              <Input
                id="albumin"
                type="number"
                step="0.1"
                value={albumin}
                onChange={(e) => setAlbumin(e.target.value)}
                placeholder="Optional - for corrected AG"
                className="mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">Recommended for accurate interpretation</p>
            </div>

            <Button
              onClick={handleCalculate}
              disabled={!sodium || !chloride || !bicarbonate}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 mt-6"
            >
              Calculate Anion Gap
            </Button>
          </div>
        </CalculatorShell>
      </div>
    </div>
  );
}