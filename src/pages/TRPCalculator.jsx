import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TestTube } from "lucide-react";
import CalculatorShell from "../components/calculators/CalculatorShell";
import { usePatient } from "../components/PatientContext";

export default function TRPCalculator() {
  const { patientData } = usePatient();
  
  const [serumPO4, setSerumPO4] = useState("");
  const [urinePO4, setUrinePO4] = useState("");
  const [serumCr, setSerumCr] = useState(patientData.serumCreatinine || "");
  const [urineCr, setUrineCr] = useState("");
  const [results, setResults] = useState(null);

  React.useEffect(() => {
    setSerumCr(patientData.serumCreatinine || serumCr);
  }, [patientData]);

  const handleCalculate = () => {
    const sPO4 = parseFloat(serumPO4);
    const uPO4 = parseFloat(urinePO4);
    const sCr = parseFloat(serumCr);
    const uCr = parseFloat(urineCr);

    if (!sPO4 || !uPO4 || !sCr || !uCr) {
      return;
    }

    // Calculate TRP (Tubular Reabsorption of Phosphate)
    // TRP% = [1 - (uPO4/sPO4) / (uCr/sCr)] × 100
    const trp = (1 - ((uPO4 / sPO4) / (uCr / sCr))) * 100;

    // Calculate TmP/GFR (Tubular maximum reabsorption of phosphate per GFR)
    // TmP/GFR = sPO4 × TRP / 100
    const tmpGFR = sPO4 * (trp / 100);

    let interpretation = "";
    let category = "";
    let safetyLevel = "safe";
    const alerts = [];
    const differentials = [];

    if (trp >= 85 && trp <= 95) {
      category = "Normal";
      interpretation = "Normal tubular phosphate reabsorption. No renal phosphate wasting.";
      safetyLevel = "safe";
    } else if (trp > 95) {
      category = "Increased Reabsorption";
      interpretation = "Elevated tubular phosphate reabsorption. Consider hyperphosphatemia causes.";
      safetyLevel = "caution";
      differentials.push("Hypoparathyroidism", "CKD", "Tumoral calcinosis", "Vitamin D toxicity");
      alerts.push({
        severity: "warning",
        title: "High TRP",
        message: "Increased phosphate reabsorption. Evaluate for hyperphosphatemia causes and hypoparathyroidism."
      });
    } else if (trp < 85) {
      category = "Decreased Reabsorption (Phosphate Wasting)";
      interpretation = "Renal phosphate wasting detected. Requires further evaluation.";
      safetyLevel = "critical";
      
      differentials.push(
        "X-linked hypophosphatemic rickets (XLH)",
        "Autosomal dominant/recessive hypophosphatemic rickets",
        "Tumor-induced osteomalacia (TIO)",
        "Fanconi syndrome",
        "Hyperparathyroidism",
        "Vitamin D deficiency rickets",
        "Renal tubular acidosis"
      );

      if (trp < 70) {
        alerts.push({
          severity: "critical",
          title: "Severe Phosphate Wasting",
          message: "TRP <70% indicates significant renal phosphate wasting. Urgent evaluation for rickets, Fanconi syndrome, or FGF23-mediated disorders."
        });
      } else {
        alerts.push({
          severity: "warning",
          title: "Moderate Phosphate Wasting",
          message: "TRP <85% suggests renal phosphate wasting. Evaluate for hypophosphatemic disorders."
        });
      }
    }

    // TmP/GFR interpretation
    let tmpInterpretation = "";
    if (tmpGFR < 2.5) {
      tmpInterpretation = "Low TmP/GFR - Renal phosphate wasting likely";
    } else if (tmpGFR >= 2.5 && tmpGFR <= 4.5) {
      tmpInterpretation = "Normal TmP/GFR - Appropriate phosphate handling";
    } else {
      tmpInterpretation = "Elevated TmP/GFR - Increased phosphate reabsorption";
    }

    const calculationTrace = [
      `TUBULAR REABSORPTION OF PHOSPHATE (TRP)`,
      ``,
      `Serum PO4: ${sPO4} mg/dL`,
      `Urine PO4: ${uPO4} mg/dL`,
      `Serum Cr: ${sCr} mg/dL`,
      `Urine Cr: ${uCr} mg/dL`,
      ``,
      `FRACTIONAL EXCRETION OF PHOSPHATE (FePO4):`,
      `FePO4 = (uPO4/sPO4) / (uCr/sCr)`,
      `FePO4 = (${uPO4}/${sPO4}) / (${uCr}/${sCr})`,
      `FePO4 = ${((uPO4 / sPO4) / (uCr / sCr)).toFixed(4)}`,
      ``,
      `TRP CALCULATION:`,
      `TRP% = [1 - FePO4] × 100`,
      `TRP% = [1 - ${((uPO4 / sPO4) / (uCr / sCr)).toFixed(4)}] × 100`,
      `TRP% = ${trp.toFixed(2)}%`,
      ``,
      `Normal range: 85-95%`,
      `Interpretation: ${category}`,
      ``,
      `TmP/GFR CALCULATION:`,
      `TmP/GFR = Serum PO4 × (TRP / 100)`,
      `TmP/GFR = ${sPO4} × (${trp.toFixed(2)} / 100)`,
      `TmP/GFR = ${tmpGFR.toFixed(2)} mg/dL`,
      ``,
      `Normal range: 2.5-4.5 mg/dL`,
      `Interpretation: ${tmpInterpretation}`
    ];

    setResults({
      safetyLevel,
      primaryResults: [
        {
          label: "TRP (%)",
          value: `${trp.toFixed(2)}%`,
          subtext: category
        },
        {
          label: "TmP/GFR",
          value: `${tmpGFR.toFixed(2)} mg/dL`,
          subtext: tmpInterpretation
        }
      ],
      safetyAlerts: alerts.length > 0 ? alerts : undefined,
      calculationTrace,
      additionalInfo: differentials.length > 0 ? [
        "Differential Diagnoses for Renal Phosphate Wasting:",
        ...differentials.map(d => `• ${d}`)
      ] : [
        "Normal tubular phosphate handling",
        "Consider age-appropriate serum phosphate reference ranges",
        "Monitor for growth and bone health"
      ],
      prescriptionText: `
TUBULAR REABSORPTION OF PHOSPHATE (TRP) ANALYSIS

Serum PO4: ${sPO4} mg/dL
Urine PO4: ${uPO4} mg/dL
Serum Cr: ${sCr} mg/dL
Urine Cr: ${uCr} mg/dL

TRP: ${trp.toFixed(2)}% (Normal: 85-95%)
TmP/GFR: ${tmpGFR.toFixed(2)} mg/dL (Normal: 2.5-4.5 mg/dL)

Interpretation: ${interpretation}

${differentials.length > 0 ? `Differential Diagnoses:\n${differentials.map((d, i) => `${i+1}. ${d}`).join('\n')}` : ''}

Recommended Workup:
1. PTH, 25-OH vitamin D, 1,25-OH vitamin D
2. FGF23 levels (if XLH or TIO suspected)
3. Alkaline phosphatase, calcium
4. Renal ultrasound, skeletal survey (if rickets)
5. Urine amino acids, glucose (Fanconi syndrome)
6. Consider genetic testing if familial hypophosphatemic rickets

Last reviewed: ${new Date().toISOString().split('T')[0]}
      `.trim(),
      references: [
        "Carpenter TO. The expanding family of hypophosphatemic syndromes. J Bone Miner Metab. 2012.",
        "Gattineni J, Baum M. Regulation of phosphate transport by fibroblast growth factor 23. Pediatr Nephrol. 2010.",
        "Imel EA, Econs MJ. Approach to the hypophosphatemic patient. J Clin Endocrinol Metab. 2012.",
        "IAP Rickets Guidelines 2020"
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
          title="TRP & TmP/GFR Calculator"
          description="Assess tubular phosphate reabsorption for hypophosphatemic disorders"
          lastReviewed="2025-01-28"
          references="IAP Rickets 2020, Carpenter TO 2012"
          results={results}
        >
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold text-slate-700">
                  Serum Phosphate (mg/dL) *
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  value={serumPO4}
                  onChange={(e) => setSerumPO4(e.target.value)}
                  placeholder="e.g., 4.5"
                  className="mt-1"
                />
                <p className="text-xs text-slate-500 mt-1">Reference: 4-7 mg/dL (age-dependent)</p>
              </div>

              <div>
                <Label className="text-sm font-semibold text-slate-700">
                  Urine Phosphate (mg/dL) *
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  value={urinePO4}
                  onChange={(e) => setUrinePO4(e.target.value)}
                  placeholder="e.g., 20"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-semibold text-slate-700">
                  Serum Creatinine (mg/dL) *
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={serumCr}
                  onChange={(e) => setSerumCr(e.target.value)}
                  placeholder="e.g., 0.6"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-semibold text-slate-700">
                  Urine Creatinine (mg/dL) *
                </Label>
                <Input
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
              disabled={!serumPO4 || !urinePO4 || !serumCr || !urineCr}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 mt-4"
            >
              <TestTube className="w-5 h-5 mr-2" />
              Calculate TRP & TmP/GFR
            </Button>
          </div>
        </CalculatorShell>
      </div>
    </div>
  );
}