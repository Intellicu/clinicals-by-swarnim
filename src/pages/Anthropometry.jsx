import React, { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Activity, TrendingUp, Info, AlertTriangle, Baby, Calculator, BarChart3 } from "lucide-react";
import { usePatient } from "../components/PatientContext";
import {
  calcWAZ, calcHAZ, calcWHZ, calcBAZ, interpretZ, zToCentile
} from "../components/growth/WHOZScoreEngine";
import GrowthZScorePanel from "../components/growth/GrowthZScorePanel";
import WHOGrowthChart from "../components/growth/WHOGrowthChart";

const colorCls = {
  red: "text-red-700 bg-red-50 border-red-300",
  amber: "text-amber-700 bg-amber-50 border-amber-300",
  green: "text-green-700 bg-green-50 border-green-300",
  blue: "text-blue-700 bg-blue-50 border-blue-300",
  orange: "text-orange-700 bg-orange-50 border-orange-300",
  gray: "text-gray-700 bg-gray-50 border-gray-300",
};

export default function Anthropometry() {
  const { patientData } = usePatient();
  const [age, setAge] = useState(patientData.age ? String(patientData.age) : "");
  const [ageUnit, setAgeUnit] = useState("years");
  const [sex, setSex] = useState(patientData.gender === "Female" ? "female" : "male");
  const [weight, setWeight] = useState(patientData.weight ? String(patientData.weight) : "");
  const [height, setHeight] = useState(patientData.height ? String(patientData.height) : "");
  const [headCirc, setHeadCirc] = useState("");
  const [muac, setMuac] = useState("");
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState("zscores");

  const handleCalculate = useCallback(() => {
    if (!age || !weight || !height) return;

    const ageMonths = ageUnit === "years"
      ? parseFloat(age) * 12
      : parseFloat(age);
    const wt = parseFloat(weight);
    const ht = parseFloat(height);
    const htM = ht / 100;
    const bmi = wt / (htM * htM);
    const bsa = Math.sqrt((ht * wt) / 3600); // Mosteller

    const waz = calcWAZ(ageMonths, wt, sex);
    const haz = calcHAZ(ageMonths, ht, sex);
    const whz = calcWHZ(ht, wt);
    const baz = ageMonths >= 24 ? calcBAZ(ageMonths, bmi, sex) : null;

    const interpretations = {
      WAZ: interpretZ(waz, 'WAZ'),
      HAZ: interpretZ(haz, 'HAZ'),
      WHZ: interpretZ(whz, 'WHZ'),
      BAZ: interpretZ(baz, 'BAZ'),
    };

    // Nutrition recommendation
    const hasWasting = whz !== null && whz < -2;
    const hasSeverWasting = whz !== null && whz < -3;
    const hasStunting = haz !== null && haz < -2;
    const hasUnderweight = waz !== null && waz < -2;

    let nutritionAction = "";
    if (hasSeverWasting) {
      nutritionAction = "URGENT: SAM protocol — therapeutic feeding (F-75/F-100/RUTF), treat complications, admit if with oedema or poor appetite.";
    } else if (hasWasting) {
      nutritionAction = "MAM: Supplementary feeding programme, high-protein diet, RUTF as outpatient. Follow-up in 2 weeks.";
    } else if (hasStunting && hasUnderweight) {
      nutritionAction = "Chronic undernutrition — intensive nutritional counselling, high-calorie diet, micronutrient supplementation (zinc, iron, Vit A).";
    } else if (hasStunting) {
      nutritionAction = "Stunting — assess for chronic illness, micronutrient deficiencies, review dietary diversity.";
    }

    setResults({
      ageMonths, wt, ht, bmi, bsa, waz, haz, whz, baz, interpretations, nutritionAction
    });
  }, [age, ageUnit, sex, weight, height]);

  const isReady = age && weight && height;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <Link to={createPageUrl("Hub")}>
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
        </Link>

        <div className="mb-6 flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
            <Baby className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Pediatric Growth Assessment</h1>
            <p className="text-sm text-slate-600">WHO LMS Z-score method · Auto-plots on WHO centile charts</p>
          </div>
        </div>

        {/* Input card */}
        <Card className="bg-white shadow-lg mb-6 border-2 border-teal-100">
          <CardHeader className="bg-gradient-to-r from-teal-50 to-green-50 border-b pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calculator className="w-5 h-5 text-teal-600" />
              Patient Measurements
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* Age */}
              <div className="col-span-2 md:col-span-1">
                <Label className="text-sm font-semibold">Age *</Label>
                <div className="flex gap-2 mt-1">
                  <Input type="number" step="0.1" min="0" value={age}
                    onChange={e => setAge(e.target.value)} placeholder="8" className="flex-1" />
                  <Select value={ageUnit} onValueChange={setAgeUnit}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="years">Years</SelectItem>
                      <SelectItem value="months">Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Sex */}
              <div>
                <Label className="text-sm font-semibold">Sex *</Label>
                <Select value={sex} onValueChange={setSex}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Weight */}
              <div>
                <Label className="text-sm font-semibold">Weight (kg) *</Label>
                <Input type="number" step="0.1" min="0" value={weight}
                  onChange={e => setWeight(e.target.value)} placeholder="25" className="mt-1" />
              </div>

              {/* Height */}
              <div>
                <Label className="text-sm font-semibold">Height/Length (cm) *</Label>
                <Input type="number" step="0.1" min="0" value={height}
                  onChange={e => setHeight(e.target.value)} placeholder="110" className="mt-1" />
              </div>

              {/* Head circumference */}
              <div>
                <Label className="text-sm font-semibold">Head Circumference (cm)</Label>
                <Input type="number" step="0.1" min="0" value={headCirc}
                  onChange={e => setHeadCirc(e.target.value)} placeholder="52 (optional)" className="mt-1" />
              </div>

              {/* MUAC */}
              <div>
                <Label className="text-sm font-semibold">MUAC (cm)</Label>
                <Input type="number" step="0.1" min="0" value={muac}
                  onChange={e => setMuac(e.target.value)} placeholder="14 (optional)" className="mt-1" />
              </div>
            </div>

            <Button onClick={handleCalculate} disabled={!isReady}
              className="w-full mt-5 bg-teal-600 hover:bg-teal-700 text-white font-semibold h-11">
              <Activity className="w-4 h-4 mr-2" />
              Calculate WHO Z-Scores & Plot
            </Button>
          </CardContent>
        </Card>

        {results && (
          <>
            {/* Summary bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { label: "BMI", value: `${results.bmi.toFixed(1)} kg/m²`, sub: "Body Mass Index" },
                { label: "BSA", value: `${results.bsa.toFixed(3)} m²`, sub: "Mosteller (drug dosing)" },
                { label: "Age", value: `${results.ageMonths.toFixed(0)}m`, sub: `${(results.ageMonths / 12).toFixed(1)} years` },
                { label: "IBW", value: `${((results.ht / 100) ** 2 * 18).toFixed(1)} kg`, sub: "Ideal (BMI 18.5)" },
              ].map(({ label, value, sub }) => (
                <Card key={label} className="bg-white border border-slate-200 shadow-sm">
                  <CardContent className="p-3 text-center">
                    <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
                    <p className="text-xl font-bold text-slate-900 mt-0.5">{value}</p>
                    <p className="text-xs text-slate-500">{sub}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* MUAC alert */}
            {muac && (
              <Alert className={`mb-4 border-2 ${parseFloat(muac) < 11.5 ? "bg-red-50 border-red-300" : parseFloat(muac) < 12.5 ? "bg-amber-50 border-amber-300" : "bg-green-50 border-green-200"}`}>
                <AlertTriangle className={`w-4 h-4 ${parseFloat(muac) < 11.5 ? "text-red-600" : parseFloat(muac) < 12.5 ? "text-amber-600" : "text-green-600"}`} />
                <AlertDescription className="font-semibold">
                  MUAC {muac} cm —{" "}
                  {parseFloat(muac) < 11.5 ? "🔴 SAM (<11.5 cm) — Severe Acute Malnutrition" :
                   parseFloat(muac) < 12.5 ? "🟡 MAM (11.5–12.5 cm) — Moderate Acute Malnutrition" :
                   "🟢 Normal (>12.5 cm)"}
                </AlertDescription>
              </Alert>
            )}

            {/* Nutrition action */}
            {results.nutritionAction && (
              <Alert className="mb-4 bg-indigo-50 border-indigo-200 border-2">
                <Info className="w-4 h-4 text-indigo-600" />
                <AlertDescription className="text-indigo-900">
                  <strong>Nutrition Action:</strong> {results.nutritionAction}
                </AlertDescription>
              </Alert>
            )}

            {/* Main tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full mb-4">
                <TabsTrigger value="zscores" className="flex-1">📊 Z-Scores</TabsTrigger>
                <TabsTrigger value="waz-chart" className="flex-1">📈 Weight Chart</TabsTrigger>
                <TabsTrigger value="haz-chart" className="flex-1">📏 Height Chart</TabsTrigger>
                <TabsTrigger value="refs" className="flex-1">📋 Reference</TabsTrigger>
              </TabsList>

              <TabsContent value="zscores">
                <Card className="bg-white shadow-lg">
                  <CardHeader className="border-b bg-slate-50">
                    <CardTitle className="text-base flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-teal-600" />
                      WHO Growth Indicators
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5">
                    <GrowthZScorePanel
                      waz={results.waz}
                      haz={results.haz}
                      whz={results.whz}
                      baz={results.baz}
                      interpretations={results.interpretations}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="waz-chart">
                <WHOGrowthChart sex={sex} ageMonths={results.ageMonths}
                  weight={weight} height={height} type="WAZ" />
              </TabsContent>

              <TabsContent value="haz-chart">
                <WHOGrowthChart sex={sex} ageMonths={results.ageMonths}
                  weight={weight} height={height} type="HAZ" />
              </TabsContent>

              <TabsContent value="refs">
                <Card className="bg-white shadow-sm">
                  <CardContent className="p-5 space-y-4 text-sm text-slate-700">
                    <div>
                      <h3 className="font-bold text-slate-900 mb-2">WHO Classification (Z-scores)</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-100">
                              <th className="border border-slate-300 p-2 text-left">Indicator</th>
                              <th className="border border-slate-300 p-2">Severe (&lt;-3)</th>
                              <th className="border border-slate-300 p-2">Moderate (&lt;-2)</th>
                              <th className="border border-slate-300 p-2">Normal</th>
                              <th className="border border-slate-300 p-2">Overweight (&gt;+2)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              ["Weight-for-Age (WAZ)", "Severe Underweight", "Underweight", "Normal", "—"],
                              ["Height-for-Age (HAZ)", "Severe Stunting", "Stunting", "Normal", "Tall for Age"],
                              ["Weight-for-Height (WHZ)", "Severe Wasting", "Wasting", "Normal", "Overweight/Obese"],
                              ["BMI-for-Age (BAZ)", "Severely Thin", "Thin", "Normal", "Overweight → Obese (>+3)"],
                            ].map(([ind, sev, mod, norm, ow]) => (
                              <tr key={ind}>
                                <td className="border border-slate-300 p-2 font-medium">{ind}</td>
                                <td className="border border-slate-300 p-2 text-red-700 bg-red-50">{sev}</td>
                                <td className="border border-slate-300 p-2 text-amber-700 bg-amber-50">{mod}</td>
                                <td className="border border-slate-300 p-2 text-green-700 bg-green-50">{norm}</td>
                                <td className="border border-slate-300 p-2 text-orange-700 bg-orange-50">{ow}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-2">MUAC Classification (WHO)</h3>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-red-50 border border-red-200 rounded p-2 text-center"><strong className="text-red-800">&lt;11.5 cm</strong><br/>SAM</div>
                        <div className="bg-amber-50 border border-amber-200 rounded p-2 text-center"><strong className="text-amber-800">11.5–12.5 cm</strong><br/>MAM</div>
                        <div className="bg-green-50 border border-green-200 rounded p-2 text-center"><strong className="text-green-800">&gt;12.5 cm</strong><br/>Normal</div>
                      </div>
                    </div>
                    <Alert className="bg-blue-50 border-blue-200">
                      <Info className="w-4 h-4 text-blue-600" />
                      <AlertDescription className="text-xs text-blue-800">
                        <strong>References:</strong> WHO Child Growth Standards (2006) for 0–5 years; WHO Reference 2007 for 5–19 years. 
                        BSA by Mosteller formula. LMS method used for Z-score computation (de Onis et al.).
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}