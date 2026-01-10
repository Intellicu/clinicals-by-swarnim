import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TestTube } from "lucide-react";
import CalculatorShell from "../components/calculators/CalculatorShell";
import { usePatient } from "../components/PatientContext";

export default function FEUACalculator() {
  const { patientData } = usePatient();
  
  const [serumUA, setSerumUA] = useState("");
  const [urineUA, setUrineUA] = useState("");
  const [serumCr, setSerumCr] = useState(patientData.serumCreatinine || "");
  const [urineCr, setUrineCr] = useState("");
  const [results, setResults] = useState(null);

  React.useEffect(() => {
    setSerumCr(patientData.serumCreatinine || serumCr);
  }, [patientData]);

  const handleCalculate = () => {
    const sUA = parseFloat(serumUA);
    const uUA = parseFloat(urineUA);
    const sCr = parseFloat(serumCr);
    const uCr = parseFloat(urineCr);

    if (!sUA || !uUA || !sCr || !uCr) {
      return;
    }

    // Calculate FEUA (Fractional Excretion of Uric Acid)
    // FEUA% = [(uUA × sCr) / (sUA × uCr)] × 100
    
    const feua = ((uUA * sCr) / (sUA * uCr)) * 100;

    let interpretation = "";
    let category = "";
    let safetyLevel = "safe";
    const alerts = [];
    const differentials = [];

    if (feua < 5) {
      category = "Low FEUA (<5%) - Uric Acid Underexcretion";
      interpretation = "Impaired renal uric acid excretion. Consider renal causes of hyperuricemia.";
      safetyLevel = "caution";
      
      if (sUA > 7.0) {
        differentials.push(
          "Primary hyperuricemia:",
          "  • Idiopathic hyperuricemia",
          "  • Genetic disorders (HPRT deficiency, PRPP synthetase overactivity)",
          "Drug-induced:",
          "  • Diuretics (thiazides, loop)",
          "  • Low-dose aspirin",
          "  • Cyclosporine, tacrolimus",
          "  • Levodopa",
          "Metabolic:",
          "  • Obesity, metabolic syndrome",
          "  • Insulin resistance",
          "Renal disease:",
          "  • CKD with reduced GFR",
          "  • Lead nephropathy",
          "  • Hereditary nephritis",
          "Endocrine:",
          "  • Hypothyroidism",
          "  • Hyperparathyroidism"
        );
        alerts.push({
          severity: "warning",
          title: "Hyperuricemia with Low FEUA",
          message: "Renal uric acid underexcretion. Evaluate for drug causes, CKD, and metabolic disorders. Risk of gout and nephrolithiasis."
        });
      }
    } else if (feua >= 5 && feua <= 10) {
      category = "Normal FEUA (5-10%)";
      interpretation = "Normal fractional excretion of uric acid. Appropriate renal handling.";
      safetyLevel = "safe";
    } else if (feua > 10) {
      category = "High FEUA (>10%) - Uric Acid Overexcretion";
      interpretation = "Increased renal uric acid excretion. Consider causes of uric acid overproduction or proximal tubular dysfunction.";
      safetyLevel = "caution";
      
      differentials.push(
        "Increased production:",
        "  • Tumor lysis syndrome",
        "  • Hemolysis",
        "  • Rhabdomyolysis",
        "  • Leukemia, lymphoma (high cell turnover)",
        "  • Psoriasis (extensive)",
        "  • Purine-rich diet",
        "Renal tubular disorders:",
        "  • Fanconi syndrome",
        "  • Hereditary renal hypouricemia (URAT1, GLUT9 mutations)",
        "  • Wilson disease",
        "  • Cystinosis",
        "Drug-induced:",
        "  • Uricosuric agents (probenecid, losartan, fenofibrate)",
        "  • High-dose aspirin",
        "  • SGLT2 inhibitors",
        "Other:",
        "  • SIADH (volume expansion)",
        "  • Pregnancy"
      );

      if (feua > 15) {
        alerts.push({
          severity: "warning",
          title: "Marked Uric Acid Overexcretion",
          message: "FEUA >15% suggests significant uric acid overproduction or proximal tubular dysfunction. Risk of uric acid nephrolithiasis. Ensure adequate hydration and urine alkalinization."
        });
      } else {
        alerts.push({
          severity: "info",
          title: "Elevated Uric Acid Excretion",
          message: "FEUA >10% indicates increased renal uric acid clearance. Evaluate for underlying cause and monitor for stone risk."
        });
      }
    }

    const calculationTrace = [
      `FRACTIONAL EXCRETION OF URIC ACID (FEUA)`,
      ``,
      `Serum Uric Acid: ${sUA} mg/dL (Normal: 2.5-5.5 mg/dL pediatric)`,
      `Urine Uric Acid: ${uUA} mg/dL`,
      `Serum Cr: ${sCr} mg/dL`,
      `Urine Cr: ${uCr} mg/dL`,
      ``,
      `FEUA CALCULATION:`,
      `FEUA% = [(uUA × sCr) / (sUA × uCr)] × 100`,
      ``,
      `FEUA = [(${uUA} × ${sCr}) / (${sUA} × ${uCr})] × 100`,
      `FEUA = [${(uUA * sCr).toFixed(4)} / ${(sUA * uCr).toFixed(4)}] × 100`,
      `FEUA = ${feua.toFixed(2)}%`,
      ``,
      `Normal range: 5-10%`,
      `Interpretation: ${category}`,
      ``,
      `CLINICAL SIGNIFICANCE:`,
      `• FEUA <5%: Underexcretion (90% of hyperuricemia cases)`,
      `• FEUA 5-10%: Normal`,
      `• FEUA >10%: Overexcretion (10% of hyperuricemia cases)`,
      `• FEUA >15%: Marked overexcretion (stone risk)`
    ];

    setResults({
      safetyLevel,
      primaryResults: [
        {
          label: "FEUA (%)",
          value: `${feua.toFixed(2)}%`,
          subtext: category
        },
        {
          label: "Serum Uric Acid",
          value: `${sUA} mg/dL`,
          subtext: sUA < 2.5 ? "Low" : sUA > 5.5 ? "High" : "Normal"
        }
      ],
      safetyAlerts: alerts.length > 0 ? alerts : undefined,
      calculationTrace,
      additionalInfo: differentials.length > 0 ? [
        "Differential Diagnoses:",
        ...differentials.map(d => d.startsWith("  ") ? d : `• ${d}`)
      ] : [
        "Normal fractional excretion of uric acid",
        "Appropriate renal handling",
        "Monitor for hyperuricemia and gout risk"
      ],
      prescriptionText: `
FRACTIONAL EXCRETION OF URIC ACID (FEUA) ANALYSIS

Serum Uric Acid: ${sUA} mg/dL (Normal: 2.5-5.5 mg/dL pediatric)
Urine Uric Acid: ${uUA} mg/dL
Serum Cr: ${sCr} mg/dL
Urine Cr: ${uCr} mg/dL

FEUA: ${feua.toFixed(2)}% (Normal: 5-10%)

Interpretation: ${interpretation}

${differentials.length > 0 ? `Differential Diagnoses:\n${differentials.map((d, i) => d.startsWith("  ") ? d : `${i+1}. ${d}`).join('\n')}` : ''}

Recommended Workup:
1. 24-hour urine: Uric acid, creatinine, calcium, oxalate (stone risk)
2. Complete metabolic panel: BUN, Cr, electrolytes
3. CBC (hemolysis, tumor lysis)
4. LDH, phosphate (cell turnover markers)
5. Renal ultrasound (nephrocalcinosis, stones)
6. Genetic testing if suspected hereditary renal hypouricemia

Management:
${feua < 5 && sUA > 7.0 ? `Hyperuricemia with Underexcretion:
• Dietary: Reduce purine-rich foods (red meat, seafood)
• Hydration: 2-3 L/day to maintain UO >1 mL/kg/h
• Avoid triggers: Alcohol, fructose, dehydration
• Pharmacologic (if symptomatic or complications):
  - Allopurinol: 5-10 mg/kg/day (max 300 mg/day)
  - OR Febuxostat: 0.5-1 mg/kg/day (adolescents)
• Monitor: Serum uric acid monthly until target <6 mg/dL` : ''}
${feua > 10 ? `Elevated Uric Acid Excretion:
• Hydration: Aggressive (3-4 L/day if tolerated)
• Urine alkalinization: Potassium citrate 1-2 mEq/kg/day (target pH 6.5-7.0)
• Avoid: High purine diet, dehydration
• Monitor: 24-hour urine pH, volume, uric acid excretion
• Stone prevention: If uric acid stones, consider allopurinol` : ''}

Last reviewed: ${new Date().toISOString().split('T')[0]}
      `.trim(),
      references: [
        "Gutman AB, Yü TF. Renal function in gout. Am J Med. 1957.",
        "Simmonds HA, et al. Hereditary xanthinuria. Arch Dis Child. 1974.",
        "Enomoto A, et al. Molecular identification of a renal urate-anion exchanger that regulates blood urate levels. Nature. 2002.",
        "Ichida K, et al. Decreased extra-renal urate excretion is a common cause of hyperuricemia. Nat Commun. 2012.",
        "IAP Hyperuricemia Management Guidelines 2023"
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
          title="FEUA Calculator (Fractional Excretion of Uric Acid)"
          description="Evaluate renal uric acid handling for hyperuricemia and stone risk"
          lastReviewed="2025-01-28"
          references="Gutman AB 1957, Enomoto A 2002"
          results={results}
        >
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold text-slate-700">
                  Serum Uric Acid (mg/dL) *
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  value={serumUA}
                  onChange={(e) => setSerumUA(e.target.value)}
                  placeholder="e.g., 6.5"
                  className="mt-1"
                />
                <p className="text-xs text-slate-500 mt-1">Reference: 2.5-5.5 mg/dL (pediatric)</p>
              </div>

              <div>
                <Label className="text-sm font-semibold text-slate-700">
                  Urine Uric Acid (mg/dL) *
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  value={urineUA}
                  onChange={(e) => setUrineUA(e.target.value)}
                  placeholder="e.g., 40"
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
              disabled={!serumUA || !urineUA || !serumCr || !urineCr}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 mt-4"
            >
              <TestTube className="w-5 h-5 mr-2" />
              Calculate FEUA
            </Button>
          </div>
        </CalculatorShell>
      </div>
    </div>
  );
}