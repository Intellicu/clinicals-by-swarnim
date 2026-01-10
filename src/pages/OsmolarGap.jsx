import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import CalculatorShell from "../components/calculators/CalculatorShell";
import { ArrowLeft } from "lucide-react";

export default function OsmolarGap() {
  const [measuredOsm, setMeasuredOsm] = useState("");
  const [sodium, setSodium] = useState("");
  const [glucose, setGlucose] = useState("");
  const [bun, setBun] = useState("");
  const [ethanol, setEthanol] = useState("");
  const [results, setResults] = useState(null);

  const handleCalculate = () => {
    if (!measuredOsm || !sodium || !glucose || !bun) return;

    const mOsm = parseFloat(measuredOsm);
    const na = parseFloat(sodium);
    const gluc = parseFloat(glucose);
    const urea = parseFloat(bun);
    const etoh = ethanol ? parseFloat(ethanol) : 0;

    const calcOsm = 2 * na + gluc / 18 + urea / 2.8 + etoh / 4.6;
    const osmGap = mOsm - calcOsm;

    const trace = [
      `Measured Osmolality: ${mOsm} mOsm/kg`,
      `Calculated Osmolality = 2×Na + Glucose/18 + BUN/2.8 + Ethanol/4.6`,
      `= 2×${na} + ${gluc}/18 + ${urea}/2.8 + ${etoh}/4.6`,
      `= ${calcOsm.toFixed(1)} mOsm/kg`,
      `Osmolar Gap = ${mOsm} - ${calcOsm.toFixed(1)} = ${osmGap.toFixed(1)} mOsm/kg`
    ];

    let interpretation = "";
    let category = "";
    let safetyLevel = "safe";
    const alerts = [];

    if (osmGap < -10) {
      category = "Negative Gap";
      interpretation = "Negative osmolar gap (<-10) is unusual and may suggest lab error, pseudohyponatremia, or very high protein/lipid levels.";
      safetyLevel = "caution";
    } else if (osmGap <= 10) {
      category = "Normal";
      interpretation = "Normal osmolar gap (-10 to +10 mOsm/kg). No unmeasured osmoles detected.";
      safetyLevel = "safe";
    } else if (osmGap <= 20) {
      category = "Mildly Elevated";
      interpretation = "Mildly elevated osmolar gap (10-20 mOsm/kg). May be normal variant or small amount of unmeasured osmoles. Consider clinical context.";
      safetyLevel = "caution";
    } else {
      category = "Significantly Elevated";
      interpretation = "Significantly elevated osmolar gap (>20 mOsm/kg) suggests presence of unmeasured osmoles. Consider toxic alcohols or other osmotically active substances.";
      alerts.push({
        severity: "critical",
        title: "Elevated Osmolar Gap",
        message: "Osmolar gap >20 suggests toxic alcohol ingestion. Urgent evaluation and treatment needed."
      });
      safetyLevel = "critical";
    }

    const recommendations = [
      "Causes of Elevated Osmolar Gap:",
      "• Toxic alcohols: Methanol, ethylene glycol, isopropanol",
      "• Ethanol (if not included in calculation)",
      "• Mannitol",
      "• Propylene glycol (in IV medications)",
      "• Acetone (DKA)",
      "• Severe renal failure (accumulation of small solutes)",
      "",
      "Management:",
      "• If osmolar gap >20 + high AG metabolic acidosis → toxic alcohol",
      "• Methanol/EG: Fomepizole, hemodialysis, correct acidosis",
      "• Check specific levels if available",
      "• Do NOT wait for specific levels if clinical suspicion high",
      "",
      "Note:",
      "• Normal osmolar gap does NOT rule out late ethylene glycol/methanol",
      "• Once metabolized, osmolar gap normalizes but AG acidosis worsens"
    ];

    setResults({
      safetyLevel,
      calculationTrace: trace,
      primaryResults: [
        {
          label: "Osmolar Gap",
          value: `${osmGap.toFixed(1)} mOsm/kg`,
          subtext: category
        },
        {
          label: "Calculated Osmolality",
          value: `${calcOsm.toFixed(1)} mOsm/kg`,
          subtext: `Measured: ${mOsm}`
        }
      ],
      safetyAlerts: alerts.length > 0 ? alerts : undefined,
      additionalInfo: [
        `Interpretation: ${interpretation}`,
        "",
        ...recommendations
      ],
      prescriptionText: `Osmolar Gap:
Result: ${osmGap.toFixed(1)} mOsm/kg
Category: ${category}

Measured Osmolality: ${mOsm} mOsm/kg
Calculated Osmolality: ${calcOsm.toFixed(1)} mOsm/kg

${interpretation}

Normal range: -10 to +10 mOsm/kg`,
      references: [
        "Glasser L et al. Serum osmolality and its applicability to drug overdose. Am J Clin Pathol. 1973;60(5):695-699.",
        "Kraut JA, Kurtz I. Toxic alcohol ingestions: clinical features, diagnosis, and management. Clin J Am Soc Nephrol. 2008;3(1):208-225.",
        "Lynd LD et al. An evaluation of the osmole gap as a screening test for toxic alcohol poisoning. BMC Emerg Med. 2008;8:5."
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
          title="Osmolar Gap Calculator"
          description="Calculate osmolar gap to detect unmeasured osmoles (toxic alcohols)"
          lastReviewed="2025-01-28"
          references="Glasser 1973, Kraut 2008"
          results={results}
          onCopyPrescription={handleCopyPrescription}
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="measuredOsm" className="text-sm font-semibold text-slate-700">
                Measured Serum Osmolality (mOsm/kg) *
              </Label>
              <Input
                id="measuredOsm"
                type="number"
                step="1"
                value={measuredOsm}
                onChange={(e) => setMeasuredOsm(e.target.value)}
                placeholder="e.g., 320"
                className="mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">From laboratory measurement</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sodium" className="text-sm font-semibold text-slate-700">
                  Serum Sodium (mEq/L) *
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
                <Label htmlFor="glucose" className="text-sm font-semibold text-slate-700">
                  Glucose (mg/dL) *
                </Label>
                <Input
                  id="glucose"
                  type="number"
                  step="1"
                  value={glucose}
                  onChange={(e) => setGlucose(e.target.value)}
                  placeholder="e.g., 100"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="bun" className="text-sm font-semibold text-slate-700">
                  BUN (mg/dL) *
                </Label>
                <Input
                  id="bun"
                  type="number"
                  step="0.1"
                  value={bun}
                  onChange={(e) => setBun(e.target.value)}
                  placeholder="e.g., 20"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="ethanol" className="text-sm font-semibold text-slate-700">
                  Ethanol (mg/dL)
                </Label>
                <Input
                  id="ethanol"
                  type="number"
                  step="1"
                  value={ethanol}
                  onChange={(e) => setEthanol(e.target.value)}
                  placeholder="Optional"
                  className="mt-1"
                />
                <p className="text-xs text-slate-500 mt-1">Include if known</p>
              </div>
            </div>

            <Button
              onClick={handleCalculate}
              disabled={!measuredOsm || !sodium || !glucose || !bun}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 mt-6"
            >
              Calculate Osmolar Gap
            </Button>
          </div>
        </CalculatorShell>
      </div>
    </div>
  );
}