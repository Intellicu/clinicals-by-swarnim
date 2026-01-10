import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft } from "lucide-react";
import CalculatorShell from "../components/calculators/CalculatorShell";
import { usePatient } from "../components/PatientContext";

export default function SchwartzGFR() {
  const { patientData } = usePatient();
  
  const [height, setHeight] = useState(patientData.height || "");
  const [creatinine, setCreatinine] = useState(patientData.serumCreatinine || "");
  const [results, setResults] = useState(null);

  React.useEffect(() => {
    setHeight(patientData.height || height);
    setCreatinine(patientData.serumCreatinine || creatinine);
  }, [patientData]);

  const handleCalculate = () => {
    const h = parseFloat(height);
    const cr = parseFloat(creatinine);
    
    if (!h || !cr) return;

    const kValue = 0.413; // Bedside Schwartz
    const gfr = kValue * (h / cr);
    
    let stage = "";
    let description = "";
    let color = "safe";
    let alerts = [];

    if (gfr >= 90) {
      stage = "G1";
      description = "Normal or high";
      color = "safe";
    } else if (gfr >= 60) {
      stage = "G2";
      description = "Mildly decreased";
      color = "safe";
    } else if (gfr >= 30) {
      stage = "G3";
      description = "Moderately decreased";
      color = "caution";
      alerts.push({
        severity: "warning",
        title: "Moderate CKD",
        message: "Consider referral to pediatric nephrologist. Monitor closely."
      });
    } else if (gfr >= 15) {
      stage = "G4";
      description = "Severely decreased";
      color = "critical";
      alerts.push({
        severity: "critical",
        title: "Severe CKD",
        message: "Urgent nephrology referral. Prepare for RRT planning."
      });
    } else {
      stage = "G5";
      description = "Kidney failure";
      color = "critical";
      alerts.push({
        severity: "critical",
        title: "Kidney Failure",
        message: "Urgent dialysis evaluation required. Nephrology consultation mandatory."
      });
    }

    setResults({
      safetyLevel: color,
      primaryResults: [
        {
          label: "eGFR (Schwartz)",
          value: `${gfr.toFixed(1)} mL/min/1.73m²`,
          subtext: "Bedside Schwartz formula"
        },
        {
          label: "CKD Stage",
          value: stage,
          subtext: description
        }
      ],
      safetyAlerts: alerts.length > 0 ? alerts : undefined,
      calculationTrace: [
        `Height: ${h} cm`,
        `Serum Creatinine: ${cr} mg/dL`,
        `k-value: ${kValue} (Bedside Schwartz)`,
        `eGFR = k × (Height / Creatinine)`,
        `eGFR = ${kValue} × (${h} / ${cr})`,
        `eGFR = ${gfr.toFixed(1)} mL/min/1.73m²`
      ],
      monitoringPlan: [
        "Monitor serum creatinine every 3-6 months",
        "Blood pressure monitoring at each visit",
        "Annual urine protein-to-creatinine ratio",
        "Growth parameters assessment",
        "Electrolytes (Na, K, HCO3, Ca, PO4) monitoring",
        "PTH and vitamin D levels if CKD stage 3+"
      ],
      additionalInfo: [
        "Schwartz formula most accurate for children 1-16 years",
        "May overestimate GFR in obese children",
        "Consider CKiD equation for more precision",
        "Cystatin C may be more accurate in some cases"
      ],
      references: [
        "Schwartz GJ, Muñoz A, Schneider MF, et al. New equations to estimate GFR in children with CKD. J Am Soc Nephrol. 2009;20(3):629-37.",
        "KDIGO 2024 Clinical Practice Guideline for the Evaluation and Management of Chronic Kidney Disease.",
        "Levey AS, Eckardt KU, Tsukamoto Y, et al. Definition and classification of chronic kidney disease. Kidney Int. 2005;67(6):2089-100."
      ]
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Link to={createPageUrl("Hub")}>
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hub
          </Button>
        </Link>

        <CalculatorShell
          title="Schwartz GFR Calculator"
          description="Estimate glomerular filtration rate in children using the Bedside Schwartz equation"
          lastReviewed="2025-01-28"
          references="Schwartz et al. JASN 2009, KDIGO 2024"
          results={results}
          showMonitoring={true}
        >
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-semibold text-slate-700">Height (cm) *</Label>
              <Input
                type="number"
                step="0.1"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="e.g., 120"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold text-slate-700">Serum Creatinine (mg/dL) *</Label>
              <Input
                type="number"
                step="0.01"
                value={creatinine}
                onChange={(e) => setCreatinine(e.target.value)}
                placeholder="e.g., 0.6"
                className="mt-1"
              />
            </div>

            <Button
              onClick={handleCalculate}
              disabled={!height || !creatinine}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6"
            >
              Calculate eGFR
            </Button>
          </div>
        </CalculatorShell>
      </div>
    </div>
  );
}