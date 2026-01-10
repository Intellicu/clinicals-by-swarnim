import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CalculatorShell from "../components/calculators/CalculatorShell";

export default function Proteinuria() {
  const [inputType, setInputType] = useState("upcr");
  const [value, setValue] = useState("");
  const [weight, setWeight] = useState("");
  const [protein24h, setProtein24h] = useState("");
  const [results, setResults] = useState(null);

  const handleCalculate = () => {
    if (!value && !protein24h) return;

    let proteinMgPerDay = 0;
    let proteinMgKgDay = 0;
    const trace = [];

    if (inputType === "upcr") {
      // UPCR in mg/mg
      const upcr = parseFloat(value);
      // Approximate: UPCR (mg/mg) ≈ g protein/day in adults
      // For children, estimate varies. Rough: UPCR × BSA or weight factor
      proteinMgPerDay = upcr * 1000; // rough approximation
      trace.push(`UPCR: ${upcr} mg/mg`);
      trace.push(`Estimated protein excretion: ~${proteinMgPerDay} mg/day`);
    } else if (inputType === "acr") {
      // ACR in mg/g (albumin to creatinine ratio)
      const acr = parseFloat(value);
      // Rough conversion: ACR (mg/g) × daily creatinine excretion
      // For estimation: ACR × 1 ≈ mg albumin/day (very rough)
      proteinMgPerDay = acr; // simplified
      trace.push(`ACR: ${acr} mg/g`);
      trace.push(`Estimated albumin excretion: ~${proteinMgPerDay} mg/day`);
    } else if (inputType === "24h") {
      proteinMgPerDay = parseFloat(protein24h);
      trace.push(`24-hour urine protein: ${proteinMgPerDay} mg/day`);
    }

    if (weight) {
      const wt = parseFloat(weight);
      proteinMgKgDay = proteinMgPerDay / wt;
      trace.push(`Weight: ${wt} kg`);
      trace.push(`Protein excretion: ${proteinMgKgDay.toFixed(1)} mg/kg/day`);
    }

    let category = "";
    let safetyLevel = "safe";
    
    if (proteinMgKgDay < 4) {
      category = "Normal (<4 mg/kg/day)";
      safetyLevel = "safe";
    } else if (proteinMgKgDay < 40) {
      category = "Mild proteinuria (4-40 mg/kg/day)";
      safetyLevel = "caution";
    } else {
      category = "Nephrotic range (≥40 mg/kg/day)";
      safetyLevel = "critical";
    }

    const alerts = [];
    if (proteinMgKgDay >= 40) {
      alerts.push({
        severity: "critical",
        title: "Nephrotic Range Proteinuria",
        message: "≥40 mg/kg/day suggests nephrotic syndrome. Comprehensive evaluation required."
      });
    } else if (proteinMgKgDay >= 4) {
      alerts.push({
        severity: "warning",
        title: "Elevated Proteinuria",
        message: "Persistent proteinuria warrants investigation for underlying kidney disease."
      });
    }

    const additionalInfo = [
      "Proteinuria Categories:",
      "• Normal: <4 mg/kg/day",
      "• Mild: 4-40 mg/kg/day",
      "• Nephrotic range: ≥40 mg/kg/day (or ≥3000 mg/1.73m²/day)",
      "",
      "Next Steps:",
      proteinMgKgDay >= 40 ? "• Serum albumin, lipid profile, renal function" : "",
      proteinMgKgDay >= 40 ? "• Consider renal biopsy if etiology unclear" : "",
      proteinMgKgDay >= 4 ? "• Repeat urine tests to confirm persistence" : "",
      proteinMgKgDay >= 4 ? "• BP monitoring, renal ultrasound" : ""
    ].filter(Boolean);

    setResults({
      safetyLevel,
      calculationTrace: trace,
      primaryResults: [
        {
          label: "Protein Excretion",
          value: weight ? `${proteinMgKgDay.toFixed(1)} mg/kg/day` : `${proteinMgPerDay.toFixed(0)} mg/day`,
          subtext: category
        }
      ],
      safetyAlerts: alerts.length > 0 ? alerts : undefined,
      additionalInfo,
      prescriptionText: `Proteinuria Assessment:
${inputType === "upcr" ? `UPCR: ${value} mg/mg` : inputType === "acr" ? `ACR: ${value} mg/g` : `24h protein: ${protein24h} mg`}
${weight ? `Weight: ${weight} kg\nProtein: ${proteinMgKgDay.toFixed(1)} mg/kg/day` : `Protein: ${proteinMgPerDay.toFixed(0)} mg/day`}
Category: ${category}`,
      references: [
        "KDIGO CKD Guidelines 2024",
        "Hogg RJ et al. Evaluation and management of proteinuria and nephrotic syndrome in children. Pediatrics. 2000."
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
      title="Proteinuria Calculator"
      description="Quantify and categorize proteinuria from UPCR, ACR, or 24h collection"
      lastReviewed="2025-01-28"
      references="KDIGO 2024"
      results={results}
      onCopyPrescription={handleCopyPrescription}
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="inputType" className="text-sm font-semibold text-slate-700">
            Input Type
          </Label>
          <Select value={inputType} onValueChange={setInputType}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upcr">Urine Protein/Creatinine Ratio (UPCR)</SelectItem>
              <SelectItem value="acr">Albumin/Creatinine Ratio (ACR)</SelectItem>
              <SelectItem value="24h">24-hour Urine Protein</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {inputType === "upcr" && (
          <div>
            <Label htmlFor="value" className="text-sm font-semibold text-slate-700">
              UPCR (mg/mg) *
            </Label>
            <Input
              id="value"
              type="number"
              step="0.1"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g., 2.5"
              className="mt-1"
            />
          </div>
        )}

        {inputType === "acr" && (
          <div>
            <Label htmlFor="value" className="text-sm font-semibold text-slate-700">
              ACR (mg/g) *
            </Label>
            <Input
              id="value"
              type="number"
              step="0.1"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g., 150"
              className="mt-1"
            />
          </div>
        )}

        {inputType === "24h" && (
          <div>
            <Label htmlFor="protein24h" className="text-sm font-semibold text-slate-700">
              24-hour Protein (mg) *
            </Label>
            <Input
              id="protein24h"
              type="number"
              value={protein24h}
              onChange={(e) => setProtein24h(e.target.value)}
              placeholder="e.g., 500"
              className="mt-1"
            />
          </div>
        )}

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
            placeholder="For mg/kg/day calculation"
            className="mt-1"
          />
        </div>

        <Button
          onClick={handleCalculate}
          disabled={(!value && !protein24h)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 mt-6"
        >
          Calculate Proteinuria
        </Button>
      </div>
    </CalculatorShell>
  );
}