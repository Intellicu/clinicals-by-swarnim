
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CalculatorShell from "../components/calculators/CalculatorShell";
import { ArrowLeft } from "lucide-react";

export default function PotassiumCalculator() {
  const [weight, setWeight] = useState("");
  const [currentK, setCurrentK] = useState("");
  const [targetK, setTargetK] = useState("4.0");
  const [route, setRoute] = useState("oral");
  const [results, setResults] = useState(null);

  const handleCalculate = () => {
    if (!weight || !currentK || !targetK) return;

    const wt = parseFloat(weight);
    const k = parseFloat(currentK);
    const target = parseFloat(targetK);

    // K+ replacement calculation
    // IV: Each 10 mEq ↑ serum K by ~0.1 mEq/L (in 70kg adult)
    // Adjust for weight: (target - current) × wt × 4
    // PO: Less predictable, roughly 40-60% absorption

    const deficit = (target - k) * wt * 4; // mEq total body deficit
    let replacement = 0;
    let doseText = "";

    if (route === "oral") {
      // Oral K+ supplementation
      replacement = deficit * 1.5; // Account for ~60% absorption
      const maxSingleDose = 40; // mEq per dose
      const doses = Math.ceil(replacement / maxSingleDose);
      doseText = `Give ${Math.min(replacement, maxSingleDose).toFixed(0)} mEq PO, repeat every 4-6 hours as needed (total ${Math.ceil(replacement).toFixed(0)} mEq over ${doses} doses)`;
    } else {
      // IV K+ replacement
      replacement = deficit;
      const maxRate = 0.5; // mEq/kg/hr max infusion rate
      const safeRate = 0.3; // mEq/kg/hr safe rate
      const hours = Math.ceil(replacement / (wt * safeRate));
      doseText = `IV KCl ${Math.ceil(replacement).toFixed(0)} mEq in NS/D5W over ${hours}+ hours (rate: ${(safeRate * wt).toFixed(1)} mEq/hr, max ${(maxRate * wt).toFixed(1)} mEq/hr)`;
    }

    const trace = [
      `Current K+: ${k} mEq/L`,
      `Target K+: ${target} mEq/L`,
      `Weight: ${wt} kg`,
      `Estimated deficit: (${target} - ${k}) × ${wt} × 4 = ${deficit.toFixed(0)} mEq`,
      route === "oral" ? `Oral replacement (accounting for absorption): ${replacement.toFixed(0)} mEq` : `IV replacement: ${replacement.toFixed(0)} mEq`
    ];

    let severity = "normal";
    let safetyLevel = "safe";
    const alerts = [];

    if (k < 2.5) {
      severity = "severe";
      alerts.push({
        severity: "critical",
        title: "Severe Hypokalemia",
        message: "K+ <2.5 mEq/L: Risk of arrhythmias. Urgent IV replacement with cardiac monitoring required."
      });
      safetyLevel = "critical";
    } else if (k < 3.0) {
      if (severity !== "severe") severity = "moderate-severe";
      alerts.push({
        severity: "warning",
        title: "Moderate Hypokalemia",
        message: "K+ <3.0 mEq/L: ECG monitoring recommended during replacement."
      });
      safetyLevel = "caution";
    } else if (k < 3.5) {
      severity = "mild";
      safetyLevel = "caution";
    }

    const recommendations = [
      "General Guidelines:",
      "• Oral route preferred if K+ >2.5 and patient tolerating PO",
      "• IV route if K+ <2.5, arrhythmias, NPO, or malabsorption",
      "• Maximum IV infusion rate: 0.5 mEq/kg/hr (with cardiac monitoring)",
      "• Safe IV rate: 0.3 mEq/kg/hr in peripheral line",
      "• Maximum concentration: 40 mEq/L in peripheral line, 80 mEq/L in central line",
      "",
      "Monitoring:",
      "• Recheck K+ after each replacement dose",
      "• Monitor Mg++ (hypomagnesemia impairs K+ repletion)",
      "• ECG if K+ <3.0 or symptomatic",
      "• Assess renal function (adjust in CKD)",
      "",
      "Oral K+ Options:",
      "• KCl tablets/liquid: 8-20 mEq per dose",
      "• K-citrate: Preferred if metabolic acidosis",
      "• Dietary K+: Banana (~10 mEq), OJ (~11 mEq/cup)",
      "",
      "IV K+ Options:",
      "• KCl 20-40 mEq in 100-250 mL NS/D5W",
      "• Infuse over 1-2 hours (peripheral)",
      "• Higher concentrations require central line"
    ];

    setResults({
      safetyLevel,
      calculationTrace: trace,
      primaryResults: [
        {
          label: "Estimated K+ Deficit",
          value: `${deficit.toFixed(0)} mEq`,
          subtext: `${route === "oral" ? "Oral" : "IV"} replacement needed`
        }
      ],
      safetyAlerts: alerts.length > 0 ? alerts : undefined,
      additionalInfo: [
        `Severity: ${severity}`,
        `Replacement dose: ${doseText}`,
        "",
        ...recommendations
      ],
      prescriptionText: `Potassium Replacement:

Current K+: ${k} mEq/L
Target K+: ${target} mEq/L
Weight: ${wt} kg

Estimated deficit: ${deficit.toFixed(0)} mEq

${doseText}

Instructions:
- Recheck K+ after each dose
- Monitor Mg++ levels (correct if low)
- ECG monitoring if K+ <3.0 or symptomatic
- Adjust for renal function`,
      references: [
        "Gennari FJ. Hypokalemia. N Engl J Med. 1998;339(7):451-458.",
        "Mount DB. Disorders of potassium balance. In: Brenner & Rector's The Kidney, 11th ed. 2019.",
        "Kraft MD et al. Treatment of electrolyte disorders in adult patients in the intensive care unit. Am J Health Syst Pharm. 2005;62(16):1663-1682."
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
          title="Potassium Replacement Calculator"
          description="Calculate K+ replacement dose for hypokalemia (IV or oral)"
          lastReviewed="2025-01-28"
          references="Gennari 1998, Mount 2019"
          results={results}
          onCopyPrescription={handleCopyPrescription}
        >
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weight" className="text-sm font-semibold text-slate-700">
                  Weight (kg) *
                </Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g., 25"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="currentK" className="text-sm font-semibold text-slate-700">
                  Current Serum K+ (mEq/L) *
                </Label>
                <Input
                  id="currentK"
                  type="number"
                  step="0.1"
                  value={currentK}
                  onChange={(e) => setCurrentK(e.target.value)}
                  placeholder="e.g., 2.8"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="targetK" className="text-sm font-semibold text-slate-700">
                  Target K+ (mEq/L) *
                </Label>
                <Input
                  id="targetK"
                  type="number"
                  step="0.1"
                  value={targetK}
                  onChange={(e) => setTargetK(e.target.value)}
                  placeholder="e.g., 4.0"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="route" className="text-sm font-semibold text-slate-700">
                  Route of Administration *
                </Label>
                <Select value={route} onValueChange={setRoute}>
                  <SelectTrigger id="route" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oral">Oral (PO)</SelectItem>
                    <SelectItem value="iv">Intravenous (IV)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleCalculate}
              disabled={!weight || !currentK || !targetK}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 mt-6"
            >
              Calculate K+ Replacement
            </Button>
          </div>
        </CalculatorShell>
      </div>
    </div>
  );
}
