import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import CalculatorShell from "../components/calculators/CalculatorShell";
import { ArrowLeft } from "lucide-react";

export default function RTAClassifier() {
  const [urinePh, setUrinePh] = useState("");
  const [serumHco3, setSerumHco3] = useState("");
  const [serumK, setSerumK] = useState("");
  const [anionGap, setAnionGap] = useState("");
  const [results, setResults] = useState(null);

  const handleCalculate = () => {
    if (!urinePh || !serumHco3) return;

    const uPH = parseFloat(urinePh);
    const hco3 = parseFloat(serumHco3);
    const k = serumK ? parseFloat(serumK) : null;
    const ag = anionGap ? parseFloat(anionGap) : null;

    const trace = [
      `Urine pH: ${uPH}`,
      `Serum HCO3: ${hco3} mEq/L`,
      k !== null ? `Serum K: ${k} mEq/L` : "",
      ag !== null ? `Anion Gap: ${ag} mEq/L` : ""
    ].filter(Boolean);

    let rtaType = "";
    let rtaFull = "";
    let defect = "";
    let causes = [];
    let treatment = [];
    let safetyLevel = "safe";
    const alerts = [];

    const isAcidotic = hco3 < 22;
    const normalAG = !ag || ag < 16;

    if (!isAcidotic) {
      rtaType = "No RTA";
      rtaFull = "Normal acid-base status or non-RTA metabolic acidosis";
      trace.push("Serum HCO3 normal → No RTA");
    } else if (!normalAG && ag && ag >= 16) {
      rtaType = "Consider High AG Acidosis";
      rtaFull = "High anion gap suggests other cause (lactate, DKA, uremia)";
      trace.push("High anion gap → Not typical RTA");
    } else {
      trace.push("Normal AG metabolic acidosis → Evaluate RTA type");

      if (uPH > 5.5 && hco3 < 16) {
        rtaType = "Type 1 RTA (Distal)";
        rtaFull = "Distal Renal Tubular Acidosis";
        defect = "Inability to secrete H+ in distal tubule → cannot acidify urine";
        causes = [
          "Primary: genetic (mutations in H+-ATPase, band 3, carbonic anhydrase II)",
          "Secondary: autoimmune (Sjögren's, SLE), drugs (amphotericin B, lithium), obstructive uropathy",
          "Hypercalciuria/nephrocalcinosis"
        ];
        treatment = [
          "Alkali therapy: Sodium bicarbonate 1-3 mEq/kg/day OR Potassium citrate",
          "Goal: Normalize HCO3 (>22 mEq/L)",
          "Monitor: growth in children, bone health, nephrocalcinosis",
          "Potassium supplementation often needed"
        ];
        
        if (k !== null && k < 3.5) {
          alerts.push({
            severity: "warning",
            title: "Hypokalemia",
            message: "Type 1 RTA typically causes hypokalemia. Supplement potassium."
          });
        }
        
        alerts.push({
          severity: "warning",
          title: "Type 1 RTA",
          message: "Risk of nephrocalcinosis and stones. Monitor with renal ultrasound."
        });
        safetyLevel = "caution";
        
      } else if (uPH < 5.5 && hco3 >= 16 && hco3 < 22) {
        rtaType = "Type 2 RTA (Proximal)";
        rtaFull = "Proximal Renal Tubular Acidosis";
        defect = "Impaired HCO3 reabsorption in proximal tubule → bicarbonate wasting";
        causes = [
          "Primary: genetic (mutations in NBC1, carbonic anhydrase II)",
          "Secondary: Fanconi syndrome, cystinosis, Wilson's disease",
          "Drugs: acetazolamide, topiramate, tenofovir",
          "Paraproteinemias, heavy metals"
        ];
        treatment = [
          "High-dose alkali: 10-15 mEq/kg/day (much higher than Type 1)",
          "Potassium citrate or sodium bicarbonate",
          "Thiazide diuretics may help reduce bicarbonate requirement",
          "Treat underlying cause (Fanconi, cystinosis)"
        ];
        
        if (k !== null && k < 3.5) {
          alerts.push({
            severity: "warning",
            title: "Hypokalemia",
            message: "Severe K+ losses with alkali therapy. Aggressive K+ supplementation required."
          });
        }
        
        alerts.push({
          severity: "info",
          title: "Type 2 RTA",
          message: "Evaluate for Fanconi syndrome (glucosuria, phosphaturia, aminoaciduria)."
        });
        safetyLevel = "caution";
        
      } else if (k !== null && k > 5.5) {
        rtaType = "Type 4 RTA (Hyperkalemic)";
        rtaFull = "Type 4 Renal Tubular Acidosis (Aldosterone deficiency/resistance)";
        defect = "Aldosterone deficiency or resistance → impaired K+ and H+ secretion";
        causes = [
          "Aldosterone deficiency: Addison's disease, hyporeninemic hypoaldosteronism (diabetes, NSAIDs)",
          "Aldosterone resistance: drugs (K+-sparing diuretics, ACE-i, ARBs, calcineurin inhibitors)",
          "Pseudohypoaldosteronism (genetic)",
          "Obstructive uropathy"
        ];
        treatment = [
          "Treat hyperkalemia: loop diuretics (furosemide)",
          "Sodium bicarbonate 1-2 mEq/kg/day if acidosis severe",
          "Fludrocortisone 0.05-0.2 mg/day if aldosterone deficient",
          "Stop K+-retaining drugs (ACE-i, ARBs, K+-sparing diuretics)",
          "Dietary K+ restriction"
        ];
        
        alerts.push({
          severity: "critical",
          title: "Hyperkalemia",
          message: "Type 4 RTA with K+ >5.5. Risk of arrhythmia. Urgent K+ management required."
        });
        safetyLevel = "critical";
        
      } else {
        rtaType = "Indeterminate";
        rtaFull = "Unable to classify - consider further testing";
        trace.push("Further workup needed:");
        trace.push("• Urine anion gap or osmolar gap");
        trace.push("• Ammonium chloride loading test");
        trace.push("• Bicarbonate titration study");
      }
    }

    const recommendations = [];
    if (rtaType.includes("Type")) {
      recommendations.push("Diagnostic Workup:");
      recommendations.push("• Urine anion gap (or osmolar gap)");
      recommendations.push("• Fractional excretion of HCO3 (if Type 2 suspected)");
      recommendations.push("• Serum aldosterone and renin (if Type 4)");
      recommendations.push("• Ultrasound kidneys (nephrocalcinosis in Type 1)");
      recommendations.push("• Genetics if familial");
    }

    setResults({
      safetyLevel,
      calculationTrace: trace,
      primaryResults: [
        {
          label: "RTA Classification",
          value: rtaType,
          subtext: rtaFull
        },
        ...(k !== null ? [{
          label: "Serum Potassium",
          value: `${k} mEq/L`,
          subtext: k < 3.5 ? "Low" : k > 5.5 ? "High" : "Normal"
        }] : [])
      ],
      safetyAlerts: alerts.length > 0 ? alerts : undefined,
      additionalInfo: [
        defect ? `Defect: ${defect}` : "",
        "",
        causes.length > 0 ? "Common Causes:" : "",
        ...causes.map(c => `• ${c}`),
        "",
        treatment.length > 0 ? "Treatment:" : "",
        ...treatment.map(t => `• ${t}`),
        "",
        ...recommendations
      ].filter(Boolean),
      prescriptionText: `RTA Classification:
Type: ${rtaType}
Urine pH: ${uPH}
Serum HCO3: ${hco3} mEq/L
${k !== null ? `Serum K: ${k} mEq/L` : ''}

${defect}

${treatment.length > 0 ? 'Treatment:\n' + treatment.join('\n') : ''}`,
      references: [
        "Rodríguez Soriano J. Renal tubular acidosis: the clinical entity. J Am Soc Nephrol. 2002;13(8):2160-2170.",
        "Karet FE. Mechanisms in hyperkalemic renal tubular acidosis. J Am Soc Nephrol. 2009;20(2):251-254.",
        "Haque SK, Ariceta G, Batlle D. Proximal renal tubular acidosis: a not so rare disorder of multiple etiologies. Nephrol Dial Transplant. 2012;27(12):4273-4287."
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
          title="RTA Classifier"
          description="Classify renal tubular acidosis type based on clinical parameters"
          lastReviewed="2025-01-28"
          references="Rodríguez Soriano 2002"
          results={results}
          onCopyPrescription={handleCopyPrescription}
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="urinePh" className="text-sm font-semibold text-slate-700">
                Urine pH *
              </Label>
              <Input
                id="urinePh"
                type="number"
                step="0.1"
                value={urinePh}
                onChange={(e) => setUrinePh(e.target.value)}
                placeholder="e.g., 6.5"
                className="mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">Key discriminator between RTA types</p>
            </div>

            <div>
              <Label htmlFor="serumHco3" className="text-sm font-semibold text-slate-700">
                Serum HCO₃⁻ (mEq/L) *
              </Label>
              <Input
                id="serumHco3"
                type="number"
                step="0.1"
                value={serumHco3}
                onChange={(e) => setSerumHco3(e.target.value)}
                placeholder="e.g., 18 (normal: 22-26)"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="serumK" className="text-sm font-semibold text-slate-700">
                Serum K⁺ (mEq/L)
              </Label>
              <Input
                id="serumK"
                type="number"
                step="0.1"
                value={serumK}
                onChange={(e) => setSerumK(e.target.value)}
                placeholder="e.g., 3.2 (normal: 3.5-5.5)"
                className="mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">Helps distinguish Type 1/2 from Type 4</p>
            </div>

            <div>
              <Label htmlFor="anionGap" className="text-sm font-semibold text-slate-700">
                Anion Gap (mEq/L)
              </Label>
              <Input
                id="anionGap"
                type="number"
                step="0.1"
                value={anionGap}
                onChange={(e) => setAnionGap(e.target.value)}
                placeholder="Optional (normal: 8-16)"
                className="mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">To rule out high AG acidosis</p>
            </div>

            <Button
              onClick={handleCalculate}
              disabled={!urinePh || !serumHco3}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 mt-6"
            >
              Classify RTA
            </Button>
          </div>
        </CalculatorShell>
      </div>
    </div>
  );
}