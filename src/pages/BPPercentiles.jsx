import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Heart, Info, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { usePatient } from "../components/PatientContext";

export default function BPPercentiles() {
  const { patientData } = usePatient();
  const [age, setAge] = useState(patientData.age || "");
  const [height, setHeight] = useState(patientData.height || "");
  const [sex, setSex] = useState(patientData.gender || "");
  const [systolic, setSystolic] = useState(patientData.systolicBP || "");
  const [diastolic, setDiastolic] = useState(patientData.diastolicBP || "");
  const [results, setResults] = useState(null);

  // AAP 2017 Simplified BP Percentiles (90th and 95th for age)
  const getBPThresholds = (ageYears) => {
    // Simplified thresholds based on AAP 2017 guidelines
    if (ageYears < 1) return { sys90: 105, sys95: 110, dia90: 70, dia95: 75 };
    if (ageYears < 3) return { sys90: 110, sys95: 115, dia90: 70, dia95: 75 };
    if (ageYears < 6) return { sys90: 115, sys95: 120, dia90: 75, dia95: 80 };
    if (ageYears < 10) return { sys90: 120, sys95: 125, dia90: 80, dia95: 85 };
    if (ageYears < 13) return { sys90: 125, sys95: 130, dia90: 80, dia95: 85 };
    return { sys90: 130, sys95: 140, dia90: 85, dia95: 90 };
  };

  const handleCalculate = () => {
    if (!age || !systolic || !diastolic || !sex) {
      return;
    }

    const ageYears = parseFloat(age);
    const sys = parseFloat(systolic);
    const dia = parseFloat(diastolic);
    const thresholds = getBPThresholds(ageYears);

    let category = "";
    let interpretation = "";
    let recommendations = [];
    let severity = "normal";

    // AAP 2017 Classification
    if (sys < thresholds.sys90 && dia < thresholds.dia90) {
      category = "Normal BP";
      interpretation = "Blood pressure is within normal range for age.";
      recommendations = [
        "Continue healthy lifestyle habits",
        "Routine BP monitoring at well-child visits",
        "Encourage regular physical activity",
        "Maintain healthy diet (low salt)"
      ];
      severity = "normal";
    } else if (sys >= thresholds.sys90 && sys < thresholds.sys95 && dia < thresholds.dia95) {
      category = "Elevated BP";
      interpretation = "Blood pressure is elevated (≥90th percentile but <95th percentile). Lifestyle modifications recommended.";
      recommendations = [
        "Repeat BP measurement in 6 months",
        "Dietary counseling (reduce sodium, increase fruits/vegetables)",
        "Weight management if overweight (BMI ≥85th percentile)",
        "Increase physical activity to ≥60 min/day",
        "Screen for other cardiovascular risk factors"
      ];
      severity = "warning";
    } else if (sys >= thresholds.sys95 && sys < thresholds.sys95 + 12) {
      category = "Stage 1 Hypertension";
      interpretation = "Blood pressure is ≥95th percentile. Requires evaluation and treatment.";
      recommendations = [
        "Repeat BP on 3 separate occasions to confirm diagnosis",
        "Ambulatory BP monitoring (ABPM) recommended",
        "Screen for secondary causes (renal, cardiac, endocrine)",
        "Lifestyle modifications (diet, exercise, weight)",
        "Consider pharmacotherapy if persistent after 3-6 months",
        "Target organ damage screening (echo, fundoscopy, microalbuminuria)"
      ];
      severity = "elevated";
    } else {
      category = "Stage 2 Hypertension";
      interpretation = "Blood pressure is ≥95th percentile + 12 mmHg. Immediate evaluation and treatment required.";
      recommendations = [
        "⚠️ START TREATMENT WITHIN 1 WEEK",
        "Immediate workup for secondary hypertension",
        "Renal ultrasound with Doppler, echocardiogram",
        "Labs: BMP, CBC, urinalysis, lipid panel, renin/aldosterone",
        "Start antihypertensive medication (ACE-I/ARB first-line)",
        "Nephrology referral",
        "If symptomatic (headache, vision changes, chest pain) → Emergency evaluation"
      ];
      severity = "critical";
    }

    setResults({
      category,
      interpretation,
      recommendations,
      severity,
      thresholds,
      systolic: sys,
      diastolic: dia
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Link to={createPageUrl("Hub")}>
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Heart className="w-8 h-8 text-red-600" />
            Blood Pressure Percentiles (AAP 2017)
          </h1>
          <p className="text-slate-600 text-sm mt-1">Pediatric hypertension screening per AAP Clinical Practice Guideline</p>
        </div>

        <Card className="bg-white shadow-lg mb-6">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold">Age (years)</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="8"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-semibold">Sex</Label>
                <Select value={sex} onValueChange={setSex}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select sex" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-semibold">Height (cm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="120"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-semibold">Systolic BP (mmHg)</Label>
                <Input
                  type="number"
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                  placeholder="110"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-semibold">Diastolic BP (mmHg)</Label>
                <Input
                  type="number"
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                  placeholder="70"
                  className="mt-1"
                />
              </div>
            </div>

            <Button
              onClick={handleCalculate}
              disabled={!age || !systolic || !diastolic || !sex}
              className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white font-semibold py-6"
            >
              <Heart className="w-5 h-5 mr-2" />
              Calculate BP Percentile
            </Button>
          </CardContent>
        </Card>

        {results && (
          <>
            <Card className={`shadow-lg mb-6 border-2 ${
              results.severity === 'critical' ? 'bg-red-50 border-red-300' :
              results.severity === 'elevated' ? 'bg-amber-50 border-amber-300' :
              results.severity === 'warning' ? 'bg-yellow-50 border-yellow-300' :
              'bg-green-50 border-green-300'
            }`}>
              <CardHeader className={`border-b ${
                results.severity === 'critical' ? 'bg-red-100' :
                results.severity === 'elevated' ? 'bg-amber-100' :
                results.severity === 'warning' ? 'bg-yellow-100' :
                'bg-green-100'
              }`}>
                <CardTitle className="flex items-center gap-2">
                  {results.severity === 'normal' ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  ) : (
                    <AlertTriangle className={`w-6 h-6 ${
                      results.severity === 'critical' ? 'text-red-600' :
                      results.severity === 'elevated' ? 'text-amber-600' :
                      'text-yellow-600'
                    }`} />
                  )}
                  {results.category}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-slate-900 mb-2">
                      {results.systolic}/{results.diastolic} mmHg
                    </div>
                    <p className="text-sm text-slate-700">{results.interpretation}</p>
                  </div>

                  <div className="bg-white/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">BP Thresholds for Age {age}y:</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>90th %ile SBP: {results.thresholds.sys90} mmHg</div>
                      <div>95th %ile SBP: {results.thresholds.sys95} mmHg</div>
                      <div>90th %ile DBP: {results.thresholds.dia90} mmHg</div>
                      <div>95th %ile DBP: {results.thresholds.dia95} mmHg</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2">Management Recommendations:</h4>
                    <ul className="space-y-2">
                      {results.recommendations.map((rec, idx) => (
                        <li key={idx} className={`text-sm flex items-start gap-2 p-2 rounded ${
                          rec.includes('⚠️') ? 'bg-red-100 text-red-900 font-semibold' : 'bg-white/70'
                        }`}>
                          <span className="font-bold">{idx + 1}.</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-50 border-slate-200">
              <CardHeader>
                <CardTitle className="text-base">AAP 2017 Guideline Reference</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-700 space-y-2">
                <p><strong>BP Measurement Technique:</strong></p>
                <ul className="list-disc ml-5 space-y-1 text-xs">
                  <li>Child seated, back supported, feet flat, arm at heart level</li>
                  <li>Appropriately sized cuff (bladder width 40% of arm circumference)</li>
                  <li>After 5 minutes of rest</li>
                  <li>Repeat 3 times on separate occasions for diagnosis</li>
                  <li>Use right arm (standardized for reference tables)</li>
                </ul>

                <p className="mt-4"><strong>Reference:</strong></p>
                <p className="text-xs">Flynn JT, et al. Clinical Practice Guideline for Screening and Management of High Blood Pressure in Children and Adolescents. Pediatrics. 2017;140(3):e20171904. 
                <br />DOI: 10.1542/peds.2017-1904</p>

                <Alert className="mt-4 bg-blue-50 border-blue-200">
                  <Info className="w-4 h-4 text-blue-600" />
                  <AlertDescription className="text-xs text-blue-800">
                    <strong>Note:</strong> This calculator uses simplified age-based thresholds from AAP 2017. For precise percentile calculation, height percentile and complete BP tables should be used. Always confirm with ABPM if screening BP is elevated.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}