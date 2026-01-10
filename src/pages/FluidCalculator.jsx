
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CalculatorShell from "../components/calculators/CalculatorShell";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function FluidCalculator() {
  const [weight, setWeight] = useState("");
  const [scenario, setScenario] = useState("maintenance");
  const [dehydrationPercent, setDehydrationPercent] = useState("");
  const [bolusVolume, setBolusVolume] = useState("20");
  const [results, setResults] = useState(null);

  const calculateMaintenance = (wt) => {
    // Holliday-Segar formula
    let maintenance;
    if (wt <= 10) {
      maintenance = 100 * wt;
    } else if (wt <= 20) {
      maintenance = 1000 + 50 * (wt - 10);
    } else {
      maintenance = 1500 + 20 * (wt - 20);
    }
    return maintenance;
  };

  const handleCalculate = () => {
    if (!weight) return;

    const wt = parseFloat(weight);
    const maintenancePerDay = calculateMaintenance(wt);
    const maintenancePerHour = maintenancePerDay / 24;

    const trace = [
      `Weight: ${wt} kg`,
      `Maintenance fluid (Holliday-Segar):`,
    ];

    if (wt <= 10) {
      trace.push(`  ${wt} kg × 100 mL/kg = ${maintenancePerDay} mL/day`);
    } else if (wt <= 20) {
      trace.push(`  1000 mL + ${(wt - 10).toFixed(1)} kg × 50 mL/kg = ${maintenancePerDay} mL/day`);
    } else {
      trace.push(`  1500 mL + ${(wt - 20).toFixed(1)} kg × 20 mL/kg = ${maintenancePerDay} mL/day`);
    }

    trace.push(`Rate: ${maintenancePerHour.toFixed(1)} mL/hr`);

    const results = {
      maintenance: maintenancePerDay,
      hourly: maintenancePerHour
    };

    const additionalInfo = [
      `Maintenance: ${maintenancePerDay} mL/day (${maintenancePerHour.toFixed(1)} mL/hr)`,
    ];

    const alerts = [];

    if (scenario === "bolus") {
      const bolus = parseFloat(bolusVolume) * wt;
      results.bolus = bolus;
      trace.push(`Bolus: ${bolusVolume} mL/kg × ${wt} kg = ${bolus.toFixed(0)} mL`);
      additionalInfo.push(`Bolus volume: ${bolus.toFixed(0)} mL over 20-30 minutes`);
      additionalInfo.push("Reassess after bolus and repeat if needed");
      alerts.push({
        severity: "info",
        title: "Fluid Bolus",
        message: "Monitor for fluid overload. Use caution in CKD/heart failure."
      });
    }

    if (scenario === "dehydration" && dehydrationPercent) {
      const deficitPercent = parseFloat(dehydrationPercent);
      const deficit = (deficitPercent / 100) * wt * 1000;
      const totalFirstDay = deficit + maintenancePerDay;
      
      results.deficit = deficit;
      results.totalFirstDay = totalFirstDay;
      
      trace.push(`Dehydration: ${deficitPercent}%`);
      trace.push(`Fluid deficit: ${deficitPercent}% × ${wt} kg × 1000 = ${deficit.toFixed(0)} mL`);
      trace.push(`Total first 24h: ${deficit.toFixed(0)} + ${maintenancePerDay} = ${totalFirstDay.toFixed(0)} mL`);
      trace.push(`Replacement rate: ${(totalFirstDay / 24).toFixed(1)} mL/hr`);

      additionalInfo.push(`Fluid deficit: ${deficit.toFixed(0)} mL`);
      additionalInfo.push(`Total D1 fluid: ${totalFirstDay.toFixed(0)} mL (${(totalFirstDay / 24).toFixed(1)} mL/hr)`);
      additionalInfo.push("Replace deficit over 24-48 hours + maintenance");
      
      alerts.push({
        severity: deficitPercent >= 10 ? "critical" : "warning",
        title: "Dehydration",
        message: `${deficitPercent}% dehydration. ${deficitPercent >= 10 ? 'Severe - consider IV rehydration' : 'Moderate - may use ORS or IV'}`
      });
    }

    const prescText = `Fluid Prescription:
Weight: ${wt} kg
Maintenance: ${maintenancePerDay} mL/day (${maintenancePerHour.toFixed(1)} mL/hr)
${scenario === "bolus" ? `\nBolus: ${results.bolus.toFixed(0)} mL (${bolusVolume} mL/kg) over 20-30 min` : ''}
${scenario === "dehydration" && results.deficit ? `\nDehydration: ${dehydrationPercent}%
Deficit: ${results.deficit.toFixed(0)} mL
Total D1: ${results.totalFirstDay.toFixed(0)} mL (${(results.totalFirstDay / 24).toFixed(1)} mL/hr)` : ''}`;

    setResults({
      safetyLevel: alerts.some(a => a.severity === "critical") ? "critical" : alerts.length > 0 ? "caution" : "safe",
      calculationTrace: trace,
      primaryResults: [
        {
          label: "Maintenance Fluid",
          value: `${maintenancePerDay} mL/day`,
          subtext: `${maintenancePerHour.toFixed(1)} mL/hr`
        },
        ...(scenario === "bolus" ? [{
          label: "Bolus Volume",
          value: `${results.bolus.toFixed(0)} mL`,
          subtext: `${bolusVolume} mL/kg`
        }] : []),
        ...(scenario === "dehydration" && results.deficit ? [{
          label: "Fluid Deficit",
          value: `${results.deficit.toFixed(0)} mL`,
          subtext: `${dehydrationPercent}% dehydration`
        }, {
          label: "Total Day 1 Fluid",
          value: `${results.totalFirstDay.toFixed(0)} mL`,
          subtext: `${(results.totalFirstDay / 24).toFixed(1)} mL/hr`
        }] : [])
      ],
      safetyAlerts: alerts.length > 0 ? alerts : undefined,
      additionalInfo,
      prescriptionText: prescText,
      references: [
        "Holliday MA, Segar WE. The maintenance need for water in parenteral fluid therapy. Pediatrics. 1957;19(5):823-832.",
        "IAP Fluid Management Guidelines 2024",
        "Harriet Lane Handbook 23e"
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
          title="Fluid Requirements Calculator"
          description="Calculate maintenance fluids, boluses, and dehydration deficit replacement"
          lastReviewed="2025-01-28"
          references="Holliday-Segar 1957, IAP 2024"
          results={results}
          onCopyPrescription={handleCopyPrescription}
        >
          <div className="space-y-4">
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
                placeholder="e.g., 15"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="scenario" className="text-sm font-semibold text-slate-700">
                Clinical Scenario
              </Label>
              <Select value={scenario} onValueChange={setScenario}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maintenance">Maintenance only</SelectItem>
                  <SelectItem value="bolus">Fluid bolus</SelectItem>
                  <SelectItem value="dehydration">Dehydration deficit replacement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {scenario === "bolus" && (
              <div>
                <Label htmlFor="bolusVolume" className="text-sm font-semibold text-slate-700">
                  Bolus Volume (mL/kg)
                </Label>
                <Select value={bolusVolume} onValueChange={setBolusVolume}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 mL/kg</SelectItem>
                    <SelectItem value="20">20 mL/kg (standard)</SelectItem>
                    <SelectItem value="30">30 mL/kg</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {scenario === "dehydration" && (
              <div>
                <Label htmlFor="dehydration" className="text-sm font-semibold text-slate-700">
                  Dehydration Percentage (%)
                </Label>
                <Input
                  id="dehydration"
                  type="number"
                  step="1"
                  value={dehydrationPercent}
                  onChange={(e) => setDehydrationPercent(e.target.value)}
                  placeholder="e.g., 5 (mild), 10 (severe)"
                  className="mt-1"
                />
                <p className="text-xs text-slate-500 mt-1">Mild: 3-5%, Moderate: 6-9%, Severe: ≥10%</p>
              </div>
            )}

            <Button
              onClick={handleCalculate}
              disabled={!weight}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 mt-6"
            >
              Calculate Fluid Plan
            </Button>
          </div>
        </CalculatorShell>
      </div>
    </div>
  );
}
