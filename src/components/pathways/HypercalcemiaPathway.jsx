import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Activity, AlertTriangle, CheckCircle, Flame } from "lucide-react";

export default function HypercalcemiaPathway() {
  const [calcium, setCalcium] = useState("");
  const [weight, setWeight] = useState("");
  const [symptomatic, setSymptomatic] = useState(false);
  const [management, setManagement] = useState(null);

  const generateManagement = () => {
    const ca = parseFloat(calcium);
    const wt = parseFloat(weight);

    let protocol;

    if (ca >= 14) {
      protocol = {
        severity: "HYPERCALCEMIC CRISIS - EMERGENCY",
        immediate: [
          {
            title: "Step 1: Aggressive IV Hydration (First 24-48 hours)",
            steps: [
              `Normal saline 10-20 mL/kg bolus over 1-2 hours`,
              `Then continuous NS at 2-3× maintenance (200-300 mL/m²/hr)`,
              `Goal: Restore volume, increase renal calcium excretion`,
              `Monitor: Urine output (target 2-4 mL/kg/hr), electrolytes q6h`,
              `⚠️ Watch for fluid overload - avoid if CHF or renal failure`
            ]
          },
          {
            title: "Step 2: Calcitonin (Rapid but Temporary Effect)",
            steps: [
              `Calcitonin 4-8 IU/kg IM or SC every 6-12 hours`,
              `Onset: 2-4 hours, reduces Ca by 1-2 mg/dL`,
              `Tachyphylaxis develops after 48h (becomes ineffective)`,
              `Use as bridge until bisphosphonates work`
            ]
          },
          {
            title: "Step 3: Bisphosphonates (Definitive Treatment)",
            steps: [
              `Pamidronate 0.5-1 mg/kg IV over 4-6 hours (max 60-90mg)`,
              `OR Zoledronic acid 0.0125-0.05 mg/kg IV over 30 min (max 4mg)`,
              `Onset: 24-48 hours, peak effect 4-7 days`,
              `Duration: 2-4 weeks`,
              `⚠️ Ensure adequate hydration before giving (risk of AKI)`,
              `Monitor: Cr, Ca, P, Mg at 48h, 1 week`
            ]
          },
          {
            title: "Step 4: Furosemide (After Adequate Hydration)",
            steps: [
              `Furosemide 1 mg/kg IV q6-12h ONLY after euvolemia restored`,
              `Enhances renal calcium excretion`,
              `Monitor electrolytes closely (hypokalemia risk)`,
              `DO NOT use if patient is volume-depleted`
            ]
          }
        ],
        severe: [
          "If Ca >16 mg/dL or symptomatic:",
          "• Consider hemodialysis (fastest Ca removal) - use low/zero calcium dialysate",
          "• ICU monitoring",
          "• Cardiac monitoring (risk of arrhythmias)",
          "• Steroids if granulomatous disease, lymphoma, or vitamin D toxicity (40-60mg prednisone equivalent daily)"
        ],
        monitoring: "Ca, P, Mg, Cr q6h until Ca <12, then q12-24h. ECG if symptomatic. Continuous cardiac monitor if Ca >14.",
        workup: "PTH, PTHrP, vitamin D (25-OH and 1,25-OH), phosphate, alkaline phosphatase, albumin. Imaging for malignancy if indicated."
      };
    } else if (ca >= 12) {
      protocol = {
        severity: "Moderate-Severe Hypercalcemia",
        treatment: [
          {
            title: "IV Hydration + Bisphosphonates",
            steps: [
              `Normal saline 1.5-2× maintenance`,
              `Pamidronate 0.5 mg/kg IV over 4 hours OR Zoledronic acid 0.025 mg/kg`,
              `Calcitonin 4 IU/kg SC q12h × 48h as bridge therapy`,
              `Furosemide 1 mg/kg after rehydration`
            ]
          }
        ],
        monitoring: "Ca, electrolytes q12h. Target Ca <12 mg/dL within 48-72 hours."
      };
    } else {
      protocol = {
        severity: "Mild Hypercalcemia",
        treatment: [
          {
            title: "Conservative Management",
            steps: [
              "Increase oral fluids - encourage 1.5-2L/day if age appropriate",
              "Avoid vitamin D and calcium supplements",
              "Avoid thiazide diuretics (increase Ca reabsorption)",
              "Treat underlying cause",
              "Monitor Ca weekly until normalized"
            ]
          }
        ]
      };
    }

    setManagement(protocol);
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-red-50 border-red-200 border-2">
        <Flame className="w-5 h-5 text-red-600" />
        <AlertDescription className="text-red-900">
          <strong>Hypercalcemic Crisis (Ca &gt;14 mg/dL):</strong> Life-threatening emergency. Causes: malignancy, vitamin D toxicity, immobilization, hyperparathyroidism, granulomatous disease. Symptoms: lethargy, confusion, polyuria, abdominal pain, arrhythmias. Requires immediate aggressive treatment.
        </AlertDescription>
      </Alert>

      {!management ? (
        <Card>
          <CardHeader className="bg-red-50 border-b">
            <CardTitle>Hypercalcemia Assessment</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Serum Calcium (mg/dL) *</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={calcium}
                  onChange={(e) => setCalcium(e.target.value)}
                  placeholder="e.g., 14.5"
                />
                <p className="text-xs text-slate-500">Normal 8.5-10.5 mg/dL</p>
              </div>
              <div>
                <Label>Weight (kg) *</Label>
                <Input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g., 30"
                />
              </div>
            </div>

            <Card className="bg-amber-50 border-amber-200">
              <CardHeader>
                <CardTitle className="text-base">Symptoms of Hypercalcemia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-3">
                  <Checkbox
                    checked={symptomatic}
                    onCheckedChange={setSymptomatic}
                    id="symptomatic"
                  />
                  <Label htmlFor="symptomatic" className="cursor-pointer font-semibold">
                    Patient has symptoms
                  </Label>
                </div>
                <p className="text-xs text-amber-800">
                  Common: Polyuria, polydipsia, constipation, abdominal pain, nausea, lethargy, weakness, confusion, bone pain
                  <br/>
                  Severe: Altered mental status, seizures, arrhythmias, renal failure
                </p>
              </CardContent>
            </Card>

            <Button
              onClick={generateManagement}
              disabled={!calcium || !weight}
              className="w-full bg-red-600 hover:bg-red-700 py-6 text-lg"
            >
              <Flame className="w-5 h-5 mr-2" />
              Generate Management Protocol
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className={`border-2 ${
            management.severity.includes("CRISIS") ? "border-red-400 bg-red-50" :
            management.severity.includes("Moderate") ? "border-amber-400 bg-amber-50" :
            "border-blue-400 bg-blue-50"
          }`}>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                {management.severity.includes("CRISIS") && <Flame className="w-7 h-7 text-red-600 animate-pulse" />}
                {management.severity}
              </CardTitle>
            </CardHeader>
          </Card>

          {management.immediate && management.immediate.map((section, idx) => (
            <Card key={idx} className="border-2 border-red-400 shadow-xl">
              <CardHeader className="bg-red-100 border-b-2">
                <CardTitle className="text-lg text-red-900">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                {section.steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white p-4 rounded-lg border-2">
                    <span className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-sm text-slate-900">{step}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          {management.treatment && management.treatment.map((section, idx) => (
            <Card key={idx} className="border-2 border-blue-300">
              <CardHeader className="bg-blue-100 border-b">
                <CardTitle className="text-lg text-blue-900">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-2">
                {section.steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-800">{step}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          {management.severe && (
            <Alert className="bg-red-50 border-red-300 border-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <AlertDescription className="text-red-900">
                <strong>Additional Measures for Severe Cases:</strong>
                <ul className="mt-2 space-y-1">
                  {management.severe.map((item, idx) => (
                    <li key={idx} className="text-sm">{item}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {management.workup && (
            <Card className="bg-purple-50 border-purple-200">
              <CardHeader>
                <CardTitle className="text-base">Diagnostic Workup</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-purple-900">{management.workup}</p>
              </CardContent>
            </Card>
          )}

          {management.monitoring && (
            <Card className="bg-cyan-50 border-cyan-200">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Monitoring Protocol
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-cyan-900">{management.monitoring}</p>
              </CardContent>
            </Card>
          )}

          <Button onClick={() => setManagement(null)} variant="outline" className="w-full">
            Re-assess
          </Button>
        </div>
      )}
    </div>
  );
}