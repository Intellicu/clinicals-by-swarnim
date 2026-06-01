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

  // AAP 2017 hardcoded BP table — 50th height percentile, sex-specific
  // Source: AAP Pediatrics 2017;140(3):e20171904, Appendix B
  const AAP_BP_TABLE = {
    1:  { M:{p90s:98,p95s:102,p99s:109,p90d:52,p95d:54,p99d:61}, F:{p90s:97,p95s:100,p99s:108,p90d:52,p95d:54,p99d:61} },
    2:  { M:{p90s:101,p95s:104,p99s:112,p90d:55,p95d:58,p99d:65}, F:{p90s:99,p95s:102,p99s:110,p90d:56,p95d:59,p99d:66} },
    3:  { M:{p90s:101,p95s:105,p99s:113,p90d:58,p95d:61,p99d:68}, F:{p90s:100,p95s:104,p99s:111,p90d:58,p95d:60,p99d:67} },
    4:  { M:{p90s:103,p95s:106,p99s:114,p90d:60,p95d:63,p99d:70}, F:{p90s:101,p95s:105,p99s:112,p90d:60,p95d:62,p99d:69} },
    5:  { M:{p90s:104,p95s:107,p99s:115,p90d:62,p95d:65,p99d:72}, F:{p90s:103,p95s:106,p99s:114,p90d:61,p95d:64,p99d:71} },
    6:  { M:{p90s:105,p95s:108,p99s:116,p90d:63,p95d:66,p99d:74}, F:{p90s:104,p95s:108,p99s:115,p90d:63,p95d:66,p99d:73} },
    7:  { M:{p90s:106,p95s:109,p99s:117,p90d:65,p95d:68,p99d:75}, F:{p90s:106,p95s:109,p99s:117,p90d:64,p95d:67,p99d:74} },
    8:  { M:{p90s:107,p95s:111,p99s:119,p90d:66,p95d:69,p99d:77}, F:{p90s:107,p95s:111,p99s:118,p90d:66,p95d:69,p99d:76} },
    9:  { M:{p90s:109,p95s:112,p99s:120,p90d:67,p95d:70,p99d:78}, F:{p90s:109,p95s:113,p99s:120,p90d:68,p95d:71,p99d:78} },
    10: { M:{p90s:110,p95s:114,p99s:121,p90d:68,p95d:72,p99d:79}, F:{p90s:111,p95s:115,p99s:122,p90d:70,p95d:73,p99d:80} },
    11: { M:{p90s:113,p95s:116,p99s:124,p90d:70,p95d:73,p99d:81}, F:{p90s:114,p95s:117,p99s:125,p90d:72,p95d:74,p99d:82} },
    12: { M:{p90s:115,p95s:119,p99s:126,p90d:72,p95d:75,p99d:82}, F:{p90s:116,p95s:119,p99s:127,p90d:74,p95d:76,p99d:84} },
  };

  const handleCalculate = () => {
    if (!age || !systolic || !diastolic || !sex) return;

    const ageYears = parseFloat(age);
    const sys = parseFloat(systolic);
    const dia = parseFloat(diastolic);
    const a = Math.round(Math.min(12, Math.max(1, ageYears)));
    const sexKey = sex === "Female" ? "F" : "M";

    let category, interpretation, recommendations, severity, thresholds;

    // ── AAP 2017: ≥13y → fixed adult thresholds ──────────────────────────────
    if (ageYears >= 13) {
      const sysRank = sys >= 140 ? 3 : sys >= 130 ? 2 : sys >= 120 ? 1 : 0;
      const diaRank = dia >= 90 ? 3 : dia >= 80 ? 2 : 0;
      const rank = Math.max(sysRank, diaRank);
      category = rank === 3 ? "Stage 2 Hypertension" : rank === 2 ? "Stage 1 Hypertension" : rank === 1 ? "Elevated BP" : "Normal BP";
      severity = rank >= 3 ? "critical" : rank === 2 ? "elevated" : rank === 1 ? "warning" : "normal";
      interpretation = `AAP 2017 (≥13y fixed thresholds): ${category}. Normal <120/80; Elevated SBP 120–129/<80; Stage 1 = 130–139/80–89; Stage 2 ≥140/90.`;
      thresholds = { sys90: 120, sys95: 130, dia90: 80, dia95: 80 };
      recommendations = rank >= 3
        ? ["⚠️ Evaluate within 1 week", "Antihypertensive therapy indicated", "Secondary cause workup", "Nephrology referral"]
        : rank === 2
        ? ["ABPM recommended", "Lifestyle modification 3–6 months", "Secondary cause screen", "Start medication if CKD/DM/organ damage"]
        : rank === 1
        ? ["Lifestyle modification 6 months", "Recheck every 3–6 months", "ABPM if white-coat HTN suspected"]
        : ["Annual BP check", "Healthy lifestyle promotion"];
    } else {
      // ── <13y: percentile-based ─────────────────────────────────────────────
      const ref = AAP_BP_TABLE[a]?.[sexKey] || AAP_BP_TABLE[a]?.["M"];
      const { p90s, p95s, p99s, p90d, p95d, p99d } = ref;
      thresholds = { sys90: p90s, sys95: p95s, dia90: p90d, dia95: p95d };
      const sys2 = p95s + 12, dia2 = p95d + 12;

      if (sys >= sys2 || dia >= dia2) {
        category = "Stage 2 Hypertension"; severity = "critical";
        interpretation = `Stage 2 HTN (AAP 2017): BP ${sys}/${dia} ≥95th+12 mmHg (threshold: ${sys2}/${dia2}) for age ${a}y. Immediate evaluation required.`;
        recommendations = ["⚠️ START TREATMENT WITHIN 1 WEEK", "Immediate secondary HTN workup", "Renal USS + Doppler, echocardiogram", "Antihypertensive medication", "Nephrology referral", "If symptomatic → Emergency evaluation"];
      } else if (sys >= p95s || dia >= p95d) {
        category = "Stage 1 Hypertension"; severity = "elevated";
        interpretation = `Stage 1 HTN (AAP 2017): BP ${sys}/${dia} ≥95th percentile (95th: ${p95s}/${p95d}) for age ${a}y.`;
        recommendations = ["Confirm on 3 separate occasions", "ABPM recommended", "Secondary cause screen (renal, cardiac, endocrine)", "Lifestyle modification", "Consider pharmacotherapy if persistent 3–6 months", "Target organ damage screen (echo, fundoscopy, microalbuminuria)"];
      } else if (sys >= p90s || dia >= p90d || sys >= 120 || dia >= 80) {
        category = "Elevated BP"; severity = "warning";
        interpretation = `Elevated BP (AAP 2017): BP ${sys}/${dia} is 90th–<95th percentile (90th: ${p90s}/${p90d}; 95th: ${p95s}/${p95d}) for age ${a}y${sys >= 120 || dia >= 80 ? " or meets ≥120/80 absolute criterion" : ""}.`;
        recommendations = ["Repeat BP in 6 months", "Dietary counseling (low sodium)", "Weight management if BMI ≥85th %ile", "Physical activity ≥60 min/day", "Cardiovascular risk factor screen"];
      } else {
        category = "Normal BP"; severity = "normal";
        interpretation = `Normal BP (AAP 2017): BP ${sys}/${dia} is <90th percentile (90th: ${p90s}/${p90d}) for age ${a}y.`;
        recommendations = ["Continue healthy lifestyle", "Routine BP monitoring at well-child visits", "Regular physical activity", "Low-salt diet"];
      }
    }

    setResults({ category, interpretation, recommendations, severity, thresholds, systolic: sys, diastolic: dia });
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
                    <h4 className="font-semibold text-sm mb-2">
                      BP Thresholds for Age {age}y {parseFloat(age) >= 13 ? "(≥13y: Fixed AAP 2017)" : "(＜13y: Percentile-based AAP 2017, 50th height %ile)"}:
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>90th %ile SBP: <strong>{results.thresholds.sys90} mmHg</strong></div>
                      <div>95th %ile SBP: <strong>{results.thresholds.sys95} mmHg</strong></div>
                      <div>90th %ile DBP: <strong>{results.thresholds.dia90} mmHg</strong></div>
                      <div>95th %ile DBP: <strong>{results.thresholds.dia95} mmHg</strong></div>
                      {parseFloat(age) < 13 && <div className="col-span-2 text-amber-700 font-semibold mt-1">Stage 2 threshold: SBP ≥{results.thresholds.sys95 + 12} or DBP ≥{results.thresholds.dia95 + 12} mmHg</div>}
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