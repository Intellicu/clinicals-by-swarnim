import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Activity, AlertTriangle, Info, Zap, CheckCircle } from "lucide-react";

export default function HyponatremiaPathway() {
  const [sodium, setSodium] = useState("");
  const [weight, setWeight] = useState("");
  const [symptomatic, setSymptomatic] = useState(false);
  const [symptoms, setSymptoms] = useState({
    seizures: false,
    alteredMentalsStatus: false,
    lethargy: false,
    headache: false,
    nausea: false
  });
  const [acute, setAcute] = useState(null);
  const [correction, setCorrection] = useState(null);

  const generateCorrection = () => {
    const na = parseFloat(sodium);
    const wt = parseFloat(weight);
    const hasSevereSymptoms = symptoms.seizures || symptoms.alteredMentalsStatus;

    let protocol;

    if (hasSevereSymptoms && na < 120) {
      const naDeficit = (125 - na) * 0.6 * wt;
      const bolus3Percent = naDeficit * 0.513 / 3;
      
      protocol = {
        severity: "SEVERE Symptomatic Hyponatremia - EMERGENCY",
        targetIncrease: "4-6 mEq/L in first 4-6 hours (STOP symptoms)",
        maxCorrection: "8-10 mEq/L in 24 hours, 18 mEq/L in 48 hours",
        emergencyProtocol: [
          {
            title: "Immediate Treatment (Active Seizures/Severe Encephalopathy)",
            steps: [
              `Give 3% NaCl bolus: 2-4 mL/kg IV over 10-15 minutes`,
              `Calculation for ${wt}kg child: ${(wt * 2).toFixed(0)}-${(wt * 4).toFixed(0)} mL of 3% NaCl`,
              `This raises Na by approximately 2-4 mEq/L`,
              `Can repeat bolus × 2-3 if seizures persist`,
              `Check Na+ level 2 hours after bolus`
            ]
          },
          {
            title: "After Initial Bolus - Controlled Correction",
            steps: [
              `Switch to 3% NaCl infusion for controlled correction`,
              `Infusion rate: 0.5-1 mL/kg/hr of 3% NaCl`,
              `Target: Increase Na by 0.5-1 mEq/L per hour`,
              `Check Na every 2-4 hours`,
              `STOP infusion when Na reaches 125-130 mEq/L OR symptoms resolve`
            ]
          }
        ],
        calculation: {
          naDeficit: naDeficit.toFixed(1),
          bolusVolume: `${(wt * 2).toFixed(0)}-${(wt * 4).toFixed(0)} mL`,
          infusionRate: `${(wt * 0.5).toFixed(1)}-${wt.toFixed(1)} mL/hr`,
          expectedRise: "2-4 mEq/L per bolus"
        },
        critical: [
          "Monitor neuro status closely - goal is symptom resolution, not complete normalization",
          "Risk of osmotic demyelination if corrected too fast - NEVER exceed 8-10 mEq/L in 24h",
          "If chronic hyponatremia (>48h) - correct even more slowly (6 mEq/L in 24h max)",
          "Consider ICU monitoring for severe symptomatic cases"
        ]
      };
    } else if (na < 125 && symptomatic) {
      protocol = {
        severity: "Moderate Symptomatic Hyponatremia",
        targetIncrease: "4-6 mEq/L in 24 hours",
        maxCorrection: "8 mEq/L in 24 hours",
        treatment: [
          {
            title: "Controlled Correction Protocol",
            steps: [
              `Give 3% NaCl: 2 mL/kg IV bolus over 30 minutes`,
              `Bolus volume for ${wt}kg: ${(wt * 2).toFixed(0)} mL`,
              `Check Na after 2 hours`,
              `If Na not increased by 2-3 mEq/L → repeat bolus`,
              `Once symptoms improve → switch to slow infusion or fluid restriction`
            ]
          }
        ],
        monitoring: "Check Na every 4-6 hours until stable, then every 12 hours"
      };
    } else {
      protocol = {
        severity: "Asymptomatic or Mild Hyponatremia",
        targetIncrease: "4-6 mEq/L in 24 hours",
        maxCorrection: "8 mEq/L in 24 hours (slower is safer)",
        treatment: [
          {
            title: "Conservative Management",
            steps: [
              "Fluid restriction: 50-75% maintenance (calculate as 1000 mL + 50 mL/kg for each kg >20 kg)",
              "Treat underlying cause (SIADH, CHF, cirrhosis, kidney disease)",
              "If fluid restriction fails after 24-48h → consider low-dose 3% NaCl infusion",
              "Oral salt supplementation if mild (1-2 g/day divided)"
            ]
          }
        ],
        monitoring: "Check Na every 12-24 hours. Expect gradual rise over 2-3 days."
      };
    }

    setCorrection(protocol);
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-red-50 border-red-200 border-2">
        <AlertTriangle className="w-5 h-5 text-red-600" />
        <AlertDescription className="text-red-900">
          <strong>Hyponatremia Emergency:</strong> Severe symptomatic hyponatremia (&lt;120 mEq/L with seizures/encephalopathy) is a medical emergency. Rapid but controlled correction needed. Risk of osmotic demyelination with overcorrection - NEVER exceed 8-10 mEq/L rise in 24 hours.
        </AlertDescription>
      </Alert>

      {!correction ? (
        <Card>
          <CardHeader className="bg-blue-50 border-b">
            <CardTitle>Hyponatremia Severity Assessment</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Serum Sodium (mEq/L) *</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={sodium}
                  onChange={(e) => setSodium(e.target.value)}
                  placeholder="e.g., 118"
                />
                <p className="text-xs text-slate-500">Normal 135-145 mEq/L</p>
              </div>
              <div>
                <Label>Weight (kg) *</Label>
                <Input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g., 25"
                />
              </div>
            </div>

            <Card className="bg-red-50 border-red-200">
              <CardHeader>
                <CardTitle className="text-base">Neurological Symptoms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={symptomatic}
                    onCheckedChange={setSymptomatic}
                    id="symptomatic"
                  />
                  <Label htmlFor="symptomatic" className="cursor-pointer font-semibold">
                    Patient has symptoms
                  </Label>
                </div>

                {symptomatic && (
                  <div className="space-y-2 pl-6 border-l-2 border-red-300">
                    {Object.entries({
                      seizures: "Seizures (SEVERE)",
                      alteredMentalsStatus: "Altered mental status / Confusion (SEVERE)",
                      lethargy: "Lethargy / Drowsiness",
                      headache: "Headache",
                      nausea: "Nausea / Vomiting"
                    }).map(([key, label]) => (
                      <div key={key} className="flex items-center gap-2">
                        <Checkbox
                          checked={symptoms[key]}
                          onCheckedChange={(checked) => setSymptoms({...symptoms, [key]: checked})}
                          id={key}
                        />
                        <Label htmlFor={key} className="cursor-pointer text-sm">{label}</Label>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div>
              <Label>Onset Timeline</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button
                  variant={acute === true ? "default" : "outline"}
                  onClick={() => setAcute(true)}
                  className={acute === true ? "bg-red-600" : ""}
                >
                  Acute (&lt;48h)
                </Button>
                <Button
                  variant={acute === false ? "default" : "outline"}
                  onClick={() => setAcute(false)}
                  className={acute === false ? "bg-amber-600" : ""}
                >
                  Chronic (&gt;48h)
                </Button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Chronic hyponatremia has HIGHER risk of osmotic demyelination - correct more slowly
              </p>
            </div>

            <Button
              onClick={generateCorrection}
              disabled={!sodium || !weight}
              className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg"
            >
              <Zap className="w-5 h-5 mr-2" />
              Generate Correction Protocol
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className={`border-2 ${
            correction.severity.includes("SEVERE") ? "border-red-400 bg-red-50" :
            correction.severity.includes("Moderate") ? "border-amber-400 bg-amber-50" :
            "border-blue-400 bg-blue-50"
          }`}>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                {correction.severity.includes("SEVERE") && <AlertTriangle className="w-7 h-7 text-red-600 animate-pulse" />}
                {correction.severity}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border-2">
                  <p className="text-sm text-slate-600">Target Na Increase</p>
                  <p className="text-2xl font-bold text-green-600">{correction.targetIncrease}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border-2">
                  <p className="text-sm text-slate-600">Maximum 24h Correction</p>
                  <p className="text-2xl font-bold text-red-600">{correction.maxCorrection}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {correction.emergencyProtocol && correction.emergencyProtocol.map((section, idx) => (
            <Card key={idx} className="border-2 border-red-400 shadow-xl">
              <CardHeader className="bg-red-100 border-b-2">
                <CardTitle className="text-lg text-red-900 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                {section.steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white p-4 rounded-lg border-2 border-red-200">
                    <span className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-sm text-slate-900 font-medium">{step}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          {correction.treatment && correction.treatment.map((section, idx) => (
            <Card key={idx} className="border-2 border-blue-300">
              <CardHeader className="bg-blue-100 border-b">
                <CardTitle className="text-lg text-blue-900">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                {section.steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white p-3 rounded-lg border">
                    <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-sm text-slate-800">{step}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          {correction.calculation && (
            <Card className="bg-purple-50 border-purple-300 border-2">
              <CardHeader>
                <CardTitle className="text-base">Calculated Values for Patient (Weight: {weight} kg)</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded border">
                  <p className="text-xs text-slate-600">3% NaCl Bolus Volume</p>
                  <p className="text-xl font-bold text-purple-700">{correction.calculation.bolusVolume}</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="text-xs text-slate-600">Expected Na Rise</p>
                  <p className="text-xl font-bold text-purple-700">{correction.calculation.expectedRise}</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="text-xs text-slate-600">Infusion Rate (if needed)</p>
                  <p className="text-xl font-bold text-purple-700">{correction.calculation.infusionRate}</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="text-xs text-slate-600">Sodium Deficit</p>
                  <p className="text-xl font-bold text-purple-700">{correction.calculation.naDeficit} mEq</p>
                </div>
              </CardContent>
            </Card>
          )}

          {correction.critical && (
            <Alert className="bg-red-50 border-red-300 border-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <AlertDescription className="text-red-900">
                <strong className="block mb-2">CRITICAL SAFETY WARNINGS:</strong>
                <ul className="space-y-1">
                  {correction.critical.map((warning, idx) => (
                    <li key={idx} className="text-sm">• {warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {correction.monitoring && (
            <Card className="bg-cyan-50 border-cyan-200">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-600" />
                  Monitoring During Correction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-cyan-900">{correction.monitoring}</p>
              </CardContent>
            </Card>
          )}

          <Card className="bg-slate-50">
            <CardHeader>
              <CardTitle className="text-lg">3% Hypertonic Saline Preparation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>3% NaCl contains 513 mEq/L sodium (30 g NaCl per liter)</strong></p>
                <p className="text-slate-700">Preparation: Add 77 mL of 23.4% NaCl to 423 mL of normal saline (0.9%) = 500 mL of 3% NaCl</p>
                <p className="text-slate-700">OR use pre-mixed 3% NaCl bags if available</p>
                <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="text-xs text-blue-900"><strong>Formula Used:</strong></p>
                  <p className="text-xs text-blue-800 font-mono">Na deficit (mEq) = (Target Na - Current Na) × 0.6 × Weight (kg)</p>
                  <p className="text-xs text-blue-800 font-mono">3% NaCl volume (mL) = Na deficit / 0.513</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={() => setCorrection(null)} variant="outline" className="w-full">
            Re-assess
          </Button>
        </div>
      )}
    </div>
  );
}