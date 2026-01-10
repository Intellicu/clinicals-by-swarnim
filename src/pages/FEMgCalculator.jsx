import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TestTube } from "lucide-react";
import CalculatorShell from "../components/calculators/CalculatorShell";
import { usePatient } from "../components/PatientContext";

export default function FEMgCalculator() {
  const { patientData } = usePatient();
  
  const [serumMg, setSerumMg] = useState("");
  const [urineMg, setUrineMg] = useState("");
  const [serumCr, setSerumCr] = useState(patientData.serumCreatinine || "");
  const [urineCr, setUrineCr] = useState("");
  const [results, setResults] = useState(null);

  React.useEffect(() => {
    setSerumCr(patientData.serumCreatinine || serumCr);
  }, [patientData]);

  const handleCalculate = () => {
    const sMg = parseFloat(serumMg);
    const uMg = parseFloat(urineMg);
    const sCr = parseFloat(serumCr);
    const uCr = parseFloat(urineCr);

    if (!sMg || !uMg || !sCr || !uCr) {
      return;
    }

    // Calculate FEMg (Fractional Excretion of Magnesium)
    // FEMg% = [(uMg × sCr) / (0.7 × sMg × uCr)] × 100
    // Note: 0.7 factor because only 70% of serum Mg is filtered (protein-bound correction)
    
    const feMg = ((uMg * sCr) / (0.7 * sMg * uCr)) * 100;

    let interpretation = "";
    let category = "";
    let safetyLevel = "safe";
    const alerts = [];
    const differentials = [];

    if (feMg <= 2) {
      category = "Low FEMg (<2%) - Appropriate Mg Retention";
      interpretation = "Normal renal magnesium conservation. Suggests extrarenal magnesium loss or inadequate intake.";
      safetyLevel = "safe";
      
      if (sMg < 1.7) {
        differentials.push(
          "Inadequate dietary intake",
          "Gastrointestinal losses (diarrhea, malabsorption)",
          "Acute pancreatitis",
          "Hungry bone syndrome (post-parathyroidectomy)",
          "Drugs: PPI, diuretics (early phase)"
        );
        alerts.push({
          severity: "warning",
          title: "Hypomagnesemia with Low FEMg",
          message: "Appropriate renal retention suggests extrarenal losses. Check GI function, nutritional status, and drug history."
        });
      }
    } else if (feMg > 2 && feMg <= 4) {
      category = "Normal FEMg (2-4%)";
      interpretation = "Normal fractional excretion of magnesium. Renal handling is appropriate.";
      safetyLevel = "safe";
    } else if (feMg > 4) {
      category = "High FEMg (>4%) - Renal Magnesium Wasting";
      interpretation = "Inappropriate renal magnesium wasting detected. Requires further evaluation.";
      safetyLevel = "critical";
      
      differentials.push(
        "Primary renal tubular disorders:",
        "  • Gitelman syndrome",
        "  • Bartter syndrome",
        "  • Familial hypomagnesemia with hypercalciuria and nephrocalcinosis (FHHNC)",
        "Drug-induced:",
        "  • Loop diuretics (furosemide)",
        "  • Thiazide diuretics",
        "  • Proton pump inhibitors (chronic use)",
        "  • Aminoglycosides",
        "  • Cisplatin",
        "  • Tacrolimus, cyclosporine",
        "Post-obstructive diuresis",
        "Recovery phase of ATN",
        "Hypercalcemia",
        "Phosphate depletion"
      );

      if (feMg > 10) {
        alerts.push({
          severity: "critical",
          title: "Severe Renal Magnesium Wasting",
          message: "FEMg >10% indicates significant tubular dysfunction. Evaluate for Gitelman/Bartter syndrome, drug toxicity, or severe tubulopathy."
        });
      } else {
        alerts.push({
          severity: "warning",
          title: "Renal Magnesium Wasting",
          message: "FEMg >4% suggests inappropriate urinary magnesium loss. Review medications and consider inherited tubulopathies."
        });
      }
    }

    const calculationTrace = [
      `FRACTIONAL EXCRETION OF MAGNESIUM (FEMg)`,
      ``,
      `Serum Mg: ${sMg} mg/dL (Normal: 1.7-2.4 mg/dL)`,
      `Urine Mg: ${uMg} mg/dL`,
      `Serum Cr: ${sCr} mg/dL`,
      `Urine Cr: ${uCr} mg/dL`,
      ``,
      `FEMg CALCULATION:`,
      `FEMg% = [(uMg × sCr) / (0.7 × sMg × uCr)] × 100`,
      ``,
      `Note: 0.7 factor accounts for protein binding (only 70% filtered)`,
      ``,
      `FEMg = [(${uMg} × ${sCr}) / (0.7 × ${sMg} × ${uCr})] × 100`,
      `FEMg = [${(uMg * sCr).toFixed(4)} / ${(0.7 * sMg * uCr).toFixed(4)}] × 100`,
      `FEMg = ${feMg.toFixed(2)}%`,
      ``,
      `Normal range: 2-4%`,
      `Interpretation: ${category}`,
      ``,
      `CLINICAL SIGNIFICANCE:`,
      `• FEMg <2%: Appropriate renal Mg retention (extrarenal losses)`,
      `• FEMg 2-4%: Normal`,
      `• FEMg >4%: Renal magnesium wasting`,
      `• FEMg >10%: Severe tubular dysfunction`
    ];

    setResults({
      safetyLevel,
      primaryResults: [
        {
          label: "FEMg (%)",
          value: `${feMg.toFixed(2)}%`,
          subtext: category
        },
        {
          label: "Serum Mg",
          value: `${sMg} mg/dL`,
          subtext: sMg < 1.7 ? "Low" : sMg > 2.4 ? "High" : "Normal"
        }
      ],
      safetyAlerts: alerts.length > 0 ? alerts : undefined,
      calculationTrace,
      additionalInfo: differentials.length > 0 ? [
        "Differential Diagnoses for Renal Magnesium Wasting:",
        ...differentials.map(d => d.startsWith("  ") ? d : `• ${d}`)
      ] : [
        "Normal fractional excretion of magnesium",
        "Appropriate renal handling",
        "Monitor for symptoms: muscle cramps, tetany, arrhythmias"
      ],
      prescriptionText: `
FRACTIONAL EXCRETION OF MAGNESIUM (FEMg) ANALYSIS

Serum Mg: ${sMg} mg/dL (Normal: 1.7-2.4 mg/dL)
Urine Mg: ${uMg} mg/dL
Serum Cr: ${sCr} mg/dL
Urine Cr: ${uCr} mg/dL

FEMg: ${feMg.toFixed(2)}% (Normal: 2-4%)

Interpretation: ${interpretation}

${differentials.length > 0 ? `Differential Diagnoses:\n${differentials.map((d, i) => d.startsWith("  ") ? d : `${i+1}. ${d}`).join('\n')}` : ''}

Recommended Workup:
1. Electrolytes: Na, K, Cl, HCO3, Ca, PO4
2. 24-hour urine: Mg, Ca, Cr for renal losses
3. PTH, 25-OH vitamin D (if hypocalcemia)
4. Renal ultrasound (nephrocalcinosis in FHHNC)
5. Genetic testing if suspected Gitelman/Bartter syndrome
6. Review medication list for Mg-wasting drugs

Management:
${feMg > 4 ? `• Oral magnesium supplementation: Mg oxide 10-20 mg/kg/day divided
• Avoid loop/thiazide diuretics if possible
• Consider amiloride or K-sparing diuretics (Gitelman)
• Monitor serum Mg, K, Ca regularly` : 
`• Address extrarenal losses if present
• Adequate dietary magnesium intake
• Recheck if persistent hypomagnesemia`}

Last reviewed: ${new Date().toISOString().split('T')[0]}
      `.trim(),
      references: [
        "Quamme GA, de Rouffignac C. Epithelial magnesium transport and regulation by the kidney. Front Biosci. 2000.",
        "Gitelman HJ, et al. A new familial disorder characterized by hypokalemia and hypomagnesemia. Trans Assoc Am Physicians. 1966.",
        "de Baaij JH, Hoenderop JG, Bindels RJ. Magnesium in man: implications for health and disease. Physiol Rev. 2015.",
        "Viering DH, de Baaij JH, Walsh SB, et al. Genetic causes of hypomagnesemia. Pediatr Nephrol. 2017."
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
          title="FEMg Calculator (Fractional Excretion of Magnesium)"
          description="Assess renal magnesium handling for hypomagnesemia evaluation"
          lastReviewed="2025-01-28"
          references="Quamme GA 2000, Gitelman HJ 1966"
          results={results}
        >
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold text-slate-700">
                  Serum Magnesium (mg/dL) *
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  value={serumMg}
                  onChange={(e) => setSerumMg(e.target.value)}
                  placeholder="e.g., 1.5"
                  className="mt-1"
                />
                <p className="text-xs text-slate-500 mt-1">Reference: 1.7-2.4 mg/dL</p>
              </div>

              <div>
                <Label className="text-sm font-semibold text-slate-700">
                  Urine Magnesium (mg/dL) *
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  value={urineMg}
                  onChange={(e) => setUrineMg(e.target.value)}
                  placeholder="e.g., 5.0"
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
              disabled={!serumMg || !urineMg || !serumCr || !urineCr}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 mt-4"
            >
              <TestTube className="w-5 h-5 mr-2" />
              Calculate FEMg
            </Button>
          </div>
        </CalculatorShell>
      </div>
    </div>
  );
}