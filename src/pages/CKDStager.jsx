import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CalculatorShell from "../components/calculators/CalculatorShell";

export default function CKDStager() {
  const [egfr, setEgfr] = useState("");
  const [albuminuria, setAlbuminuria] = useState("");
  const [albuminuriaType, setAlbuminuriaType] = useState("acr");
  const [results, setResults] = useState(null);

  const handleCalculate = () => {
    if (!egfr) return;

    const gfr = parseFloat(egfr);
    const albumin = albuminuria ? parseFloat(albuminuria) : null;

    // GFR Stage (G1-G5)
    let gStage = "";
    let gStageFull = "";
    let gColor = "safe";

    if (gfr >= 90) {
      gStage = "G1";
      gStageFull = "G1 - Normal or high (≥90)";
      gColor = "safe";
    } else if (gfr >= 60) {
      gStage = "G2";
      gStageFull = "G2 - Mildly decreased (60-89)";
      gColor = "safe";
    } else if (gfr >= 45) {
      gStage = "G3a";
      gStageFull = "G3a - Mild to moderate decrease (45-59)";
      gColor = "caution";
    } else if (gfr >= 30) {
      gStage = "G3b";
      gStageFull = "G3b - Moderate to severe decrease (30-44)";
      gColor = "caution";
    } else if (gfr >= 15) {
      gStage = "G4";
      gStageFull = "G4 - Severely decreased (15-29)";
      gColor = "critical";
    } else {
      gStage = "G5";
      gStageFull = "G5 - Kidney failure (<15)";
      gColor = "critical";
    }

    // Albuminuria Stage (A1-A3)
    let aStage = "";
    let aStageFull = "";
    let aColor = "safe";

    if (albumin !== null) {
      if (albuminuriaType === "acr") {
        // ACR in mg/g
        if (albumin < 30) {
          aStage = "A1";
          aStageFull = "A1 - Normal to mild increase (<30 mg/g)";
          aColor = "safe";
        } else if (albumin < 300) {
          aStage = "A2";
          aStageFull = "A2 - Moderate increase (30-300 mg/g)";
          aColor = "caution";
        } else {
          aStage = "A3";
          aStageFull = "A3 - Severe increase (>300 mg/g)";
          aColor = "critical";
        }
      } else {
        // UPCR in mg/mg or protein/day
        if (albumin < 150) {
          aStage = "A1";
          aStageFull = "A1 - Normal to mild";
          aColor = "safe";
        } else if (albumin < 500) {
          aStage = "A2";
          aStageFull = "A2 - Moderate increase";
          aColor = "caution";
        } else {
          aStage = "A3";
          aStageFull = "A3 - Severe increase";
          aColor = "critical";
        }
      }
    }

    const combinedStage = aStage ? `${gStage}${aStage}` : gStage;
    const overallColor = gColor === "critical" || aColor === "critical" ? "critical" : 
                         gColor === "caution" || aColor === "caution" ? "caution" : "safe";

    const trace = [
      `eGFR: ${gfr} mL/min/1.73m²`,
      `GFR Category: ${gStageFull}`,
    ];

    if (albumin !== null) {
      trace.push(`Albuminuria: ${albumin} ${albuminuriaType === "acr" ? "mg/g (ACR)" : "mg/mg (UPCR)"}`);
      trace.push(`Albuminuria Category: ${aStageFull}`);
      trace.push(`Combined CKD Stage: ${combinedStage}`);
    }

    const alerts = [];
    const recommendations = [];

    if (gfr < 60) {
      alerts.push({
        severity: gfr < 30 ? "critical" : "warning",
        title: `CKD ${gStage}`,
        message: `eGFR ${gfr} indicates ${gStageFull.split(' - ')[1]}. Nephrology follow-up ${gfr < 30 ? 'urgent' : 'recommended'}.`
      });
    }

    if (albumin !== null && albumin >= 30) {
      alerts.push({
        severity: albumin >= 300 ? "critical" : "warning",
        title: `Albuminuria ${aStage}`,
        message: `${aStageFull.split(' - ')[1]}. Increased cardiovascular and progression risk.`
      });
    }

    // Stage-specific recommendations
    if (gStage === "G1" || gStage === "G2") {
      recommendations.push("• Annual monitoring of kidney function");
      recommendations.push("• BP control (<120/80 if tolerated)");
      recommendations.push("• Consider ACE-i/ARB if albuminuria present");
      recommendations.push("• Diabetes control if applicable");
    } else if (gStage === "G3a" || gStage === "G3b") {
      recommendations.push("• Monitor every 6-12 months");
      recommendations.push("• Nephrology referral recommended");
      recommendations.push("• BP control, ACE-i/ARB");
      recommendations.push("• Avoid nephrotoxins (NSAIDs, contrast)");
      recommendations.push("• Adjust drug dosing for GFR");
      recommendations.push("• Bone mineral disease screening");
    } else if (gStage === "G4") {
      recommendations.push("• Monitor every 3-6 months");
      recommendations.push("• Nephrology care essential");
      recommendations.push("• Prepare for RRT (education, access planning)");
      recommendations.push("• Anemia management (target Hb 10-12)");
      recommendations.push("• Hyperkalemia/acidosis management");
      recommendations.push("• Dietary counseling (low K, PO4, protein)");
    } else if (gStage === "G5") {
      recommendations.push("• Nephrology management required");
      recommendations.push("• Initiate RRT planning (HD vs PD vs transplant)");
      recommendations.push("• Vascular access/PD catheter placement");
      recommendations.push("• Transplant evaluation if eligible");
      recommendations.push("• Close monitoring of complications");
    }

    if (aStage === "A2" || aStage === "A3") {
      recommendations.push("• ACE-i or ARB therapy (if not contraindicated)");
      recommendations.push("• SGLT2 inhibitor consideration");
      recommendations.push("• Dietary sodium restriction");
    }

    setResults({
      safetyLevel: overallColor,
      calculationTrace: trace,
      primaryResults: [
        {
          label: "CKD Stage",
          value: combinedStage,
          subtext: gStageFull
        },
        ...(aStage ? [{
          label: "Albuminuria Category",
          value: aStage,
          subtext: aStageFull
        }] : [])
      ],
      safetyAlerts: alerts.length > 0 ? alerts : undefined,
      additionalInfo: [
        "Management Recommendations:",
        ...recommendations,
        "",
        "CKD Risk Factors to Address:",
        "• Hypertension",
        "• Diabetes",
        "• Obesity",
        "• Smoking",
        "• Cardiovascular disease"
      ],
      prescriptionText: `CKD Staging (KDIGO):
GFR Stage: ${gStage} (eGFR ${gfr} mL/min/1.73m²)
${aStage ? `Albuminuria: ${aStage} (${albumin} ${albuminuriaType === "acr" ? "mg/g" : "mg/mg"})` : ''}
Combined Stage: ${combinedStage}

${recommendations.join('\n')}`,
      references: [
        "KDIGO 2024 Clinical Practice Guideline for the Evaluation and Management of Chronic Kidney Disease. Kidney Int. 2024;105(4S):S117-S314.",
        "Levey AS, Coresh J. Chronic kidney disease. Lancet. 2012;379(9811):165-180."
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
      title="CKD Staging Calculator"
      description="Classify chronic kidney disease using KDIGO GFR and albuminuria categories"
      lastReviewed="2025-01-28"
      references="KDIGO 2024"
      results={results}
      onCopyPrescription={handleCopyPrescription}
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="egfr" className="text-sm font-semibold text-slate-700">
            eGFR (mL/min/1.73m²) *
          </Label>
          <Input
            id="egfr"
            type="number"
            step="0.1"
            value={egfr}
            onChange={(e) => setEgfr(e.target.value)}
            placeholder="e.g., 55"
            className="mt-1"
          />
          <p className="text-xs text-slate-500 mt-1">Use Schwartz or CKiD calculator</p>
        </div>

        <div>
          <Label htmlFor="albuminuriaType" className="text-sm font-semibold text-slate-700">
            Albuminuria Test Type
          </Label>
          <Select value={albuminuriaType} onValueChange={setAlbuminuriaType}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="acr">Albumin/Creatinine Ratio (ACR)</SelectItem>
              <SelectItem value="upcr">Protein/Creatinine Ratio (UPCR)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="albuminuria" className="text-sm font-semibold text-slate-700">
            {albuminuriaType === "acr" ? "ACR (mg/g)" : "UPCR (mg/mg)"}
          </Label>
          <Input
            id="albuminuria"
            type="number"
            step="0.1"
            value={albuminuria}
            onChange={(e) => setAlbuminuria(e.target.value)}
            placeholder={albuminuriaType === "acr" ? "e.g., 150" : "e.g., 0.5"}
            className="mt-1"
          />
          <p className="text-xs text-slate-500 mt-1">Optional - for complete staging</p>
        </div>

        <Button
          onClick={handleCalculate}
          disabled={!egfr}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 mt-6"
        >
          Calculate CKD Stage
        </Button>
      </div>
    </CalculatorShell>
  );
}