
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import CalculatorShell from "../components/calculators/CalculatorShell";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ABGInterpreter() {
  const [ph, setPh] = useState("");
  const [pco2, setPco2] = useState("");
  const [hco3, setHco3] = useState("");
  const [results, setResults] = useState(null);

  const handleCalculate = () => {
    if (!ph || !pco2 || !hco3) return;

    const pH = parseFloat(ph);
    const pCO2 = parseFloat(pco2);
    const HCO3 = parseFloat(hco3);

    const trace = [
      `pH: ${pH}`,
      `pCO2: ${pCO2} mmHg`,
      `HCO3: ${HCO3} mEq/L`
    ];

    // Determine primary disorder
    let primaryDisorder = "";
    let compensation = "";
    let safetyLevel = "safe";
    const alerts = [];

    // Normal ranges
    const normalPH = [7.35, 7.45];
    const normalPCO2 = [35, 45];
    const normalHCO3 = [22, 26];

    // Step 1: Check pH
    if (pH < 7.35) {
      primaryDisorder = "Acidemia";
      trace.push("pH < 7.35 → Acidemia");
    } else if (pH > 7.45) {
      primaryDisorder = "Alkalemia";
      trace.push("pH > 7.45 → Alkalemia");
    } else {
      primaryDisorder = "Normal pH";
      trace.push("pH 7.35-7.45 → Normal or compensated");
    }

    // Step 2: Determine if respiratory or metabolic
    let disorder = "";
    let expectedCompensation = "";
    let isCompensated = false;

    if (pH < 7.35) {
      // Acidemia
      if (pCO2 > 45) {
        disorder = "Respiratory Acidosis";
        // Expected compensation: ↑HCO3
        // Acute: HCO3 increases 1 mEq/L per 10 mmHg ↑pCO2
        // Chronic: HCO3 increases 3.5 mEq/L per 10 mmHg ↑pCO2
        const deltaCO2 = pCO2 - 40;
        const expectedHCO3Acute = 24 + (deltaCO2 / 10) * 1;
        const expectedHCO3Chronic = 24 + (deltaCO2 / 10) * 3.5;
        
        if (HCO3 >= expectedHCO3Acute - 2 && HCO3 <= expectedHCO3Acute + 2) {
          compensation = "Acute (uncompensated)";
        } else if (HCO3 >= expectedHCO3Chronic - 2) {
          compensation = "Chronic (partially compensated)";
        } else {
          compensation = "Mixed disorder possible";
        }
        
        expectedCompensation = `Expected HCO3: ${expectedHCO3Acute.toFixed(1)} (acute) or ${expectedHCO3Chronic.toFixed(1)} (chronic)`;
      } else if (HCO3 < 22) {
        disorder = "Metabolic Acidosis";
        // Expected compensation: ↓pCO2
        // Winter's formula: Expected pCO2 = 1.5 × HCO3 + 8 (±2)
        const expectedPCO2 = 1.5 * HCO3 + 8;
        expectedCompensation = `Expected pCO2: ${expectedPCO2.toFixed(1)} ± 2 mmHg (Winter's)`;
        
        if (pCO2 >= expectedPCO2 - 2 && pCO2 <= expectedPCO2 + 2) {
          compensation = "Appropriate compensation";
        } else if (pCO2 > expectedPCO2 + 2) {
          compensation = "Coexistent respiratory acidosis";
        } else {
          compensation = "Coexistent respiratory alkalosis";
        }
      }
    } else if (pH > 7.45) {
      // Alkalemia
      if (pCO2 < 35) {
        disorder = "Respiratory Alkalosis";
        // Expected compensation: ↓HCO3
        // Acute: HCO3 decreases 2 mEq/L per 10 mmHg ↓pCO2
        // Chronic: HCO3 decreases 5 mEq/L per 10 mmHg ↓pCO2
        const deltaCO2 = 40 - pCO2;
        const expectedHCO3Acute = 24 - (deltaCO2 / 10) * 2;
        const expectedHCO3Chronic = 24 - (deltaCO2 / 10) * 5;
        
        if (HCO3 >= expectedHCO3Acute - 2 && HCO3 <= expectedHCO3Acute + 2) {
          compensation = "Acute (uncompensated)";
        } else if (HCO3 <= expectedHCO3Chronic + 2) {
          compensation = "Chronic (partially compensated)";
        } else {
          compensation = "Mixed disorder possible";
        }
        
        expectedCompensation = `Expected HCO3: ${expectedHCO3Acute.toFixed(1)} (acute) or ${expectedHCO3Chronic.toFixed(1)} (chronic)`;
      } else if (HCO3 > 26) {
        disorder = "Metabolic Alkalosis";
        // Expected compensation: ↑pCO2
        // Expected increase: 0.6-0.7 mmHg per 1 mEq/L ↑HCO3
        const deltaHCO3 = HCO3 - 24;
        const expectedPCO2 = 40 + deltaHCO3 * 0.7;
        expectedCompensation = `Expected pCO2: ${expectedPCO2.toFixed(1)} mmHg`;
        
        if (pCO2 >= expectedPCO2 - 5 && pCO2 <= expectedPCO2 + 5) {
          compensation = "Appropriate compensation";
        } else {
          compensation = "Mixed disorder possible";
        }
      }
    } else {
      // Normal pH
      if (pCO2 > 45 && HCO3 > 26) {
        disorder = "Compensated Respiratory Acidosis";
        compensation = "Fully compensated";
      } else if (pCO2 < 35 && HCO3 < 22) {
        disorder = "Compensated Respiratory Alkalosis";
        compensation = "Fully compensated";
      } else if (Math.abs(pCO2 - 40) < 5 && Math.abs(HCO3 - 24) < 2) {
        disorder = "Normal ABG";
        compensation = "No disorder";
      } else {
        disorder = "Mixed Disorder";
        compensation = "Complex abnormality";
      }
    }

    trace.push(`Primary: ${disorder}`);
    trace.push(compensation);
    if (expectedCompensation) trace.push(expectedCompensation);

    // Safety alerts
    if (pH < 7.20 || pH > 7.60) {
      alerts.push({
        severity: "critical",
        title: "Severe pH Abnormality",
        message: `pH ${pH} is life-threatening. Immediate intervention required.`
      });
      safetyLevel = "critical";
    } else if (pH < 7.30 || pH > 7.50) {
      alerts.push({
        severity: "warning",
        title: "Significant pH Abnormality",
        message: `pH ${pH} requires prompt management.`
      });
      safetyLevel = "caution";
    }

    if (pCO2 > 60 || pCO2 < 25) {
      alerts.push({
        severity: "warning",
        title: "Severe Ventilatory Abnormality",
        message: pCO2 > 60 ? "Respiratory failure - consider ventilatory support" : "Excessive hyperventilation"
      });
      safetyLevel = "critical";
    }

    const recommendations = [];
    if (disorder.includes("Respiratory Acidosis")) {
      recommendations.push("• Improve ventilation");
      recommendations.push("• Treat underlying cause (CNS depression, airway obstruction, lung disease)");
      recommendations.push("• Consider non-invasive or mechanical ventilation");
    } else if (disorder.includes("Respiratory Alkalosis")) {
      recommendations.push("• Identify cause (pain, anxiety, sepsis, PE, hyperventilation)");
      recommendations.push("• Treat underlying condition");
      recommendations.push("• If psychogenic: reassurance, rebreathing");
    } else if (disorder.includes("Metabolic Acidosis")) {
      recommendations.push("• Calculate anion gap");
      recommendations.push("• If high AG: MUDPILES (lactate, DKA, uremia, toxins)");
      recommendations.push("• If normal AG: GI/renal losses, RTA");
      recommendations.push("• Treat underlying cause");
      recommendations.push("• Consider bicarbonate if pH <7.1");
    } else if (disorder.includes("Metabolic Alkalosis")) {
      recommendations.push("• Assess volume status");
      recommendations.push("• Check urine chloride (saline-responsive vs resistant)");
      recommendations.push("• Treat underlying cause (vomiting, diuretics, mineralocorticoid)");
      recommendations.push("• Fluid resuscitation if volume depleted");
    }

    setResults({
      safetyLevel,
      calculationTrace: trace,
      primaryResults: [
        {
          label: "Primary Disorder",
          value: disorder,
          subtext: compensation
        },
        {
          label: "pH Status",
          value: pH < 7.35 ? "Acidemia" : pH > 7.45 ? "Alkalemia" : "Normal",
          subtext: `pH ${pH}`
        }
      ],
      safetyAlerts: alerts.length > 0 ? alerts : undefined,
      additionalInfo: [
        expectedCompensation || "",
        "",
        "Management:",
        ...recommendations
      ].filter(Boolean),
      prescriptionText: `ABG Interpretation:
pH: ${pH} (7.35-7.45)
pCO2: ${pCO2} mmHg (35-45)
HCO3: ${HCO3} mEq/L (22-26)

Analysis: ${disorder}
${compensation}
${expectedCompensation || ''}`,
      references: [
        "Berend K, de Vries AP, Gans RO. Physiological approach to assessment of acid-base disturbances. N Engl J Med. 2014;371(15):1434-1445.",
        "Seifter JL. Integration of acid-base and electrolyte disorders. N Engl J Med. 2014;371(19):1821-1831."
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
          title="ABG Interpreter"
          description="Interpret arterial blood gas results and assess compensation"
          lastReviewed="2025-01-28"
          references="Berend 2014, NEJM"
          results={results}
          onCopyPrescription={handleCopyPrescription}
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="ph" className="text-sm font-semibold text-slate-700">
                pH *
              </Label>
              <Input
                id="ph"
                type="number"
                step="0.01"
                value={ph}
                onChange={(e) => setPh(e.target.value)}
                placeholder="e.g., 7.35 (normal: 7.35-7.45)"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="pco2" className="text-sm font-semibold text-slate-700">
                pCO₂ (mmHg) *
              </Label>
              <Input
                id="pco2"
                type="number"
                step="0.1"
                value={pco2}
                onChange={(e) => setPco2(e.target.value)}
                placeholder="e.g., 40 (normal: 35-45)"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="hco3" className="text-sm font-semibold text-slate-700">
                HCO₃⁻ (mEq/L) *
              </Label>
              <Input
                id="hco3"
                type="number"
                step="0.1"
                value={hco3}
                onChange={(e) => setHco3(e.target.value)}
                placeholder="e.g., 24 (normal: 22-26)"
                className="mt-1"
              />
            </div>

            <Button
              onClick={handleCalculate}
              disabled={!ph || !pco2 || !hco3}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 mt-6"
            >
              Interpret ABG
            </Button>
          </div>
        </CalculatorShell>
      </div>
    </div>
  );
}
