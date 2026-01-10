import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Syringe, Heart, Clock, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function HypertensiveEmergency() {
  const [weight, setWeight] = useState("");
  const [bpSystolic, setBpSystolic] = useState("");
  const [results, setResults] = useState(null);

  const calculateDoses = () => {
    const wt = parseFloat(weight);
    if (!wt || wt <= 0) return;

    const drugs = [
      {
        name: "Labetalol",
        route: "IV",
        priority: 1,
        dosing: {
          bolus: `${(0.2 * wt).toFixed(1)} mg (0.2 mg/kg) IV push over 2 min`,
          repeat: `Can repeat 0.25-1 mg/kg q10-15min up to 3 mg/kg total`,
          infusion: `${(0.25 * wt).toFixed(1)} - ${(3 * wt).toFixed(1)} mg/h (0.25-3 mg/kg/h)`,
          maxDose: `${Math.min(40 * wt, 300).toFixed(0)} mg total`,
        },
        contraindications: ["Asthma", "Heart block", "Severe bradycardia"],
        monitoring: "HR, BP q5-15min, EKG",
        notes: "Drug of choice in most HTN emergencies. Safe in pregnancy."
      },
      {
        name: "Nicardipine",
        route: "IV Infusion",
        priority: 2,
        dosing: {
          start: `0.5-1 mcg/kg/min, titrate by 0.5-1 mcg/kg/min q5-15min`,
          usual: `1-3 mcg/kg/min`,
          max: `3-5 mcg/kg/min`,
        },
        contraindications: ["Advanced aortic stenosis"],
        monitoring: "BP q5-15min, HR",
        notes: "Smooth BP control. Good for CNS emergencies."
      },
      {
        name: "Hydralazine",
        route: "IV/IM",
        priority: 3,
        dosing: {
          bolus: `${(0.1 * wt).toFixed(1)} - ${(0.2 * wt).toFixed(1)} mg (0.1-0.2 mg/kg) IV/IM`,
          repeat: `Can repeat q4-6h PRN`,
          maxDose: `20 mg per dose`,
        },
        contraindications: ["Coronary artery disease", "Dissection"],
        monitoring: "BP q15-30min, HR (may cause reflex tachycardia)",
        notes: "Unpredictable response. May cause sudden drops. Safe in pregnancy."
      },
      {
        name: "Sodium Nitroprusside",
        route: "IV Infusion",
        priority: 4,
        dosing: {
          start: `0.3-0.5 mcg/kg/min`,
          usual: `0.5-3 mcg/kg/min`,
          max: `8-10 mcg/kg/min (short-term only)`,
        },
        contraindications: ["Pregnancy", "Renal failure (cyanide toxicity)"],
        monitoring: "BP continuously (arterial line), thiocyanate levels if >48h or renal failure",
        notes: "Rapid onset/offset. Risk of cyanide toxicity. ICU setting only. Light-sensitive."
      },
      {
        name: "Esmolol",
        route: "IV Infusion",
        priority: 5,
        dosing: {
          loading: `${(500 * wt).toFixed(0)} mcg (500 mcg/kg) over 1 min`,
          start: `${(50 * wt).toFixed(0)} mcg/min (50 mcg/kg/min)`,
          titrate: `Increase by 50 mcg/kg/min q5-10min`,
          max: `300 mcg/kg/min`,
        },
        contraindications: ["Asthma", "Heart block", "Decompensated HF"],
        monitoring: "HR, BP, EKG",
        notes: "Ultra-short acting beta-blocker. Good for aortic dissection with pain control."
      }
    ];

    setResults({ weight: wt, drugs });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card className="bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-2xl border-0">
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-3">
              <AlertCircle className="w-10 h-10" />
              Hypertensive Emergency Protocol
            </CardTitle>
            <p className="text-red-100">IV Antihypertensive Dosing Calculator</p>
          </CardHeader>
        </Card>

        <Alert className="bg-red-50 border-2 border-red-300">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <AlertDescription className="text-red-900">
            <strong>Hypertensive Emergency:</strong> Severe BP elevation with end-organ damage (encephalopathy, seizure, heart failure, acute kidney injury).
            Target: Reduce MAP by 10-20% in first hour, then 5-15% over next 23 hours. Avoid precipitous drops.
          </AlertDescription>
        </Alert>

        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Syringe className="w-5 h-5 text-blue-600" />
              Patient Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Weight (kg) *</Label>
                <Input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Enter weight"
                  step="0.1"
                />
              </div>
              <div>
                <Label>Current Systolic BP (mmHg)</Label>
                <Input
                  type="number"
                  value={bpSystolic}
                  onChange={(e) => setBpSystolic(e.target.value)}
                  placeholder="Optional - for reference"
                />
              </div>
            </div>
            <Button onClick={calculateDoses} className="w-full bg-red-600 hover:bg-red-700">
              <Heart className="w-4 h-4 mr-2" />
              Calculate Emergency Doses
            </Button>
          </CardContent>
        </Card>

        {results && (
          <div className="space-y-4">
            <Card className="bg-blue-50 border-2 border-blue-300">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-blue-900">
                  <Info className="w-5 h-5" />
                  <div>
                    <p className="font-semibold">General Management Principles:</p>
                    <ul className="text-sm mt-2 space-y-1 list-disc ml-5">
                      <li>Continuous BP monitoring (preferably arterial line)</li>
                      <li>IV access, cardiac monitor, pulse oximetry</li>
                      <li>Rule out secondary causes (pheochromocytoma, renal artery stenosis)</li>
                      <li>Gradual BP reduction to prevent cerebral hypoperfusion</li>
                      <li>Admit to ICU/monitored setting</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {results.drugs.map((drug, idx) => (
              <Card key={idx} className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className={`border-b ${
                  drug.priority === 1 ? 'bg-gradient-to-r from-green-50 to-emerald-50' :
                  drug.priority === 2 ? 'bg-gradient-to-r from-blue-50 to-cyan-50' :
                  'bg-slate-50'
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {drug.name}
                        {drug.priority <= 2 && (
                          <Badge className="bg-green-600 ml-2">
                            {drug.priority === 1 ? '1st Line' : '2nd Line'}
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-sm text-slate-600 mt-1">{drug.route}</p>
                    </div>
                    <Syringe className="w-8 h-8 text-red-500" />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="bg-slate-50 rounded-lg p-4 border-l-4 border-red-500">
                      <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Dosing for {results.weight} kg patient:
                      </h4>
                      {Object.entries(drug.dosing).map(([key, value]) => (
                        <div key={key} className="mb-2">
                          <span className="text-xs font-semibold text-slate-600 uppercase">{key.replace(/_/g, ' ')}:</span>
                          <p className="text-sm font-mono text-slate-900 mt-0.5">{value}</p>
                        </div>
                      ))}
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">Monitoring:</h4>
                      <p className="text-sm text-slate-700">{drug.monitoring}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Contraindications:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {drug.contraindications.map((ci, i) => (
                          <Badge key={i} variant="outline" className="bg-red-50 text-red-800 border-red-300">
                            {ci}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-1 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Clinical Pearls:
                      </h4>
                      <p className="text-sm text-blue-800">{drug.notes}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="bg-amber-50 border-2 border-amber-300">
              <CardContent className="p-4">
                <div className="flex items-start gap-2 text-amber-900">
                  <AlertCircle className="w-5 h-5 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-2">Important Considerations:</p>
                    <ul className="text-sm space-y-1 list-disc ml-5">
                      <li><strong>Target BP:</strong> Reduce MAP by 10-20% in first hour (not to normal levels)</li>
                      <li><strong>Avoid:</strong> Rapid BP drops can cause stroke, MI, or renal failure</li>
                      <li><strong>Nifedipine:</strong> Sublingual/bite-and-swallow immediate-release is NOT recommended (unpredictable absorption)</li>
                      <li><strong>Oral therapy:</strong> Start before stopping IV to ensure smooth transition</li>
                      <li><strong>Workup:</strong> Evaluate for secondary causes (renovascular, endocrine, coarctation)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-50">
              <CardContent className="p-4 text-xs text-slate-600">
                <p className="mb-2"><strong>References:</strong></p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>AAP Clinical Practice Guideline for Screening and Management of High Blood Pressure in Children and Adolescents, 2017</li>
                  <li>IAP Pediatric Hypertension Consensus Guidelines, 2022</li>
                  <li>KDIGO Clinical Practice Guideline for the Management of Blood Pressure in Chronic Kidney Disease, 2021</li>
                </ul>
                <p className="mt-3 italic text-red-600">⚠️ For informational purposes. Verify all doses. Clinical judgment essential in emergencies.</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}