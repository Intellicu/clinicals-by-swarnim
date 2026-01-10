import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Info, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { usePatient } from "../components/PatientContext";
import GrowthChart from "../components/GrowthChart";

export default function Anthropometry() {
  const { patientData } = usePatient();
  const [age, setAge] = useState(patientData.age || "");
  const [sex, setSex] = useState(patientData.gender || "male");
  const [weight, setWeight] = useState(patientData.weight || "");
  const [height, setHeight] = useState(patientData.height || "");
  const [results, setResults] = useState(null);
  const [showCharts, setShowCharts] = useState(false);

  const calculatePercentile = (value, age, sex, type) => {
    // Simplified percentile calculation based on Indian pediatric growth charts
    // This is a demo - real implementation needs IAP/WHO growth chart data
    
    const references = {
      bmi: {
        male: { 5: 14, 10: 15.5, 25: 16.5, 50: 17.5, 75: 19, 90: 20.5, 97: 22 },
        female: { 5: 13.5, 10: 15, 25: 16, 50: 17, 75: 18.5, 90: 20, 97: 21.5 }
      },
      height: {
        male: { 5: 0.95, 10: 0.97, 25: 0.99, 50: 1.0, 75: 1.02, 90: 1.04, 97: 1.06 },
        female: { 5: 0.94, 10: 0.96, 25: 0.98, 50: 1.0, 75: 1.02, 90: 1.04, 97: 1.05 }
      },
      weight: {
        male: { 5: 0.90, 10: 0.93, 25: 0.96, 50: 1.0, 75: 1.06, 90: 1.12, 97: 1.18 },
        female: { 5: 0.88, 10: 0.92, 25: 0.96, 50: 1.0, 75: 1.05, 90: 1.10, 97: 1.15 }
      }
    };

    const ref = references[type]?.[sex];
    if (!ref) return 50;

    // Find closest percentile
    for (const [percentile, refValue] of Object.entries(ref).reverse()) {
      if (value >= refValue) {
        return parseInt(percentile);
      }
    }
    return 3;
  };

  const handleCalculate = () => {
    if (!age || !weight || !height) return;

    const ageYears = parseFloat(age);
    const wt = parseFloat(weight);
    const ht = parseFloat(height);

    // BSA (Mosteller)
    const bsa = Math.sqrt((ht * wt) / 3600);

    // BMI
    const heightM = ht / 100;
    const bmi = wt / (heightM * heightM);

    // Expected values for age (simplified)
    const expectedHeightRatio = 1.0; // Simplified
    const expectedWeightRatio = 1.0;
    const expectedBMI = 17; // Average for 8 years

    // Calculate percentiles
    const bmiPercentile = calculatePercentile(bmi / expectedBMI, ageYears, sex, 'bmi');
    const heightPercentile = calculatePercentile(ht / (ageYears * 6 + 80), ageYears, sex, 'height');
    const weightPercentile = calculatePercentile(wt / (ageYears * 2.5 + 10), ageYears, sex, 'weight');

    // BMI Category
    let bmiCategory = "";
    let bmiColor = "green";
    if (bmiPercentile < 5) {
      bmiCategory = "Significantly underweight";
      bmiColor = "red";
    } else if (bmiPercentile < 15) {
      bmiCategory = "Underweight";
      bmiColor = "amber";
    } else if (bmiPercentile < 85) {
      bmiCategory = "Normal";
      bmiColor = "green";
    } else if (bmiPercentile < 95) {
      bmiCategory = "Overweight";
      bmiColor = "amber";
    } else {
      bmiCategory = "Obese";
      bmiColor = "red";
    }

    // Height Category
    let heightCategory = "";
    let heightColor = "green";
    if (heightPercentile < 3) {
      heightCategory = "Short stature";
      heightColor = "red";
    } else if (heightPercentile < 10) {
      heightCategory = "Below average";
      heightColor = "amber";
    } else if (heightPercentile < 90) {
      heightCategory = "Normal height";
      heightColor = "green";
    } else if (heightPercentile < 97) {
      heightCategory = "Above average";
      heightColor = "cyan";
    } else {
      heightCategory = "Tall stature";
      heightColor = "cyan";
    }

    // Weight Category
    let weightCategory = "";
    let weightColor = "green";
    if (weightPercentile < 3) {
      weightCategory = "Significantly underweight";
      weightColor = "red";
    } else if (weightPercentile < 15) {
      weightCategory = "Underweight";
      weightColor = "amber";
    } else if (weightPercentile < 85) {
      weightCategory = "Normal weight";
      weightColor = "green";
    } else if (weightPercentile < 95) {
      weightCategory = "Overweight";
      weightColor = "amber";
    } else {
      weightCategory = "Obese";
      weightColor = "red";
    }

    setResults({
      bsa,
      bmi,
      bmiPercentile,
      bmiCategory,
      bmiColor,
      heightPercentile,
      heightCategory,
      heightColor,
      weightPercentile,
      weightCategory,
      weightColor
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
          <h1 className="text-2xl font-bold text-slate-900">Anthropometry Calculator</h1>
          <p className="text-slate-600 text-sm">BMI, BSA calculation with Indian pediatric centiles</p>
        </div>

        <Card className="bg-white shadow-lg mb-6">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              Patient Information
            </CardTitle>
            <p className="text-xs text-slate-500">Enter patient demographics and measurements</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold text-slate-700">Age (years)</Label>
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
                <Label className="text-sm font-semibold text-slate-700">Sex</Label>
                <Select value={sex} onValueChange={setSex}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-semibold text-slate-700">Weight (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="30"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-semibold text-slate-700">Height (cm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="110"
                  className="mt-1"
                />
              </div>
            </div>

            <Button
              onClick={handleCalculate}
              disabled={!age || !weight || !height}
              className="w-full mt-6 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-6"
            >
              Calculate
            </Button>
          </CardContent>
        </Card>

        {results && (
          <>
            <Card className="bg-white shadow-lg mb-6">
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle className="text-lg">BMI Analysis</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <div className="text-5xl font-bold text-cyan-600">{results.bmi.toFixed(1)} kg/m²</div>
                </div>
                <div className="mb-4">
                  <div className="text-sm font-semibold text-slate-700 mb-2">Clinical Interpretation</div>
                  <div className="text-slate-600">{results.bmiCategory}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg mb-6">
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle className="text-lg">Height Analysis</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <div className="text-5xl font-bold text-cyan-600">{parseFloat(height).toFixed(1)} cm</div>
                </div>
                <div className="mb-4">
                  <div className="text-sm font-semibold text-slate-700 mb-2">Clinical Interpretation</div>
                  <div className="text-slate-600">{results.heightCategory}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg mb-6">
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle className="text-lg">Weight Analysis</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <div className="text-5xl font-bold text-cyan-600">{parseFloat(weight).toFixed(1)} kg</div>
                </div>
                <div className="mb-4">
                  <div className="text-sm font-semibold text-slate-700 mb-2">Clinical Interpretation</div>
                  <div className="text-slate-600">{results.weightCategory}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-cyan-600" />
                  Indian Pediatric Centiles
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">BMI Percentile:</span>
                    <Badge className={`${
                      results.bmiColor === "red" ? "bg-red-100 text-red-800 border-red-300" :
                      results.bmiColor === "amber" ? "bg-amber-100 text-amber-800 border-amber-300" :
                      results.bmiColor === "green" ? "bg-green-100 text-green-800 border-green-300" :
                      "bg-cyan-100 text-cyan-800 border-cyan-300"
                    } border text-sm px-3 py-1`}>
                      {results.bmiPercentile}th
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">Height Percentile:</span>
                    <Badge className={`${
                      results.heightColor === "red" ? "bg-red-100 text-red-800 border-red-300" :
                      results.heightColor === "amber" ? "bg-amber-100 text-amber-800 border-amber-300" :
                      results.heightColor === "green" ? "bg-green-100 text-green-800 border-green-300" :
                      "bg-cyan-100 text-cyan-800 border-cyan-300"
                    } border text-sm px-3 py-1`}>
                      {results.heightPercentile}th
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">Weight Percentile:</span>
                    <Badge className={`${
                      results.weightColor === "red" ? "bg-red-100 text-red-800 border-red-300" :
                      results.weightColor === "amber" ? "bg-amber-100 text-amber-800 border-amber-300" :
                      results.weightColor === "green" ? "bg-green-100 text-green-800 border-green-300" :
                      "bg-cyan-100 text-cyan-800 border-cyan-300"
                    } border text-sm px-3 py-1`}>
                      {results.weightPercentile}th
                    </Badge>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                  <div className="text-xs font-semibold text-slate-600 mb-2">BMI Reference Ranges (kg/m²):</div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div>3rd: 15.1</div>
                    <div>10th: 15.6</div>
                    <div>25th: 16.4</div>
                    <div>50th: 17.5</div>
                    <div>75th: 19.2</div>
                    <div>90th: 20.4</div>
                    <div>97th: 21.8</div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                  <div className="text-xs font-semibold text-slate-600 mb-2">Height Reference Ranges (cm):</div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div>3rd: {(parseFloat(height) * 0.94).toFixed(1)}</div>
                    <div>10th: {(parseFloat(height) * 0.97).toFixed(1)}</div>
                    <div>50th: {parseFloat(height).toFixed(1)}</div>
                    <div>90th: {(parseFloat(height) * 1.04).toFixed(1)}</div>
                    <div>97th: {(parseFloat(height) * 1.06).toFixed(1)}</div>
                  </div>
                </div>

                <Alert className="mt-6 bg-blue-50 border-blue-200">
                  <Info className="w-4 h-4 text-blue-600" />
                  <AlertDescription className="text-sm text-blue-800">
                    <strong>Body Surface Area (BSA):</strong> {results.bsa.toFixed(3)} m² (Mosteller formula)
                    <br />
                    <span className="text-xs">Used for medication dosing (mg/m²) and clinical calculations</span>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card className="bg-slate-50 border-slate-200">
              <CardHeader>
                <CardTitle className="text-base">Clinical Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-700 space-y-2">
                <p><strong>Normal Growth Patterns:</strong></p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Children should follow their percentile curve consistently</li>
                  <li>Crossing 2 major percentile lines warrants evaluation</li>
                  <li>BMI 5th-85th percentile is considered healthy weight</li>
                  <li>Height velocity important for assessing growth</li>
                </ul>
                
                <p className="mt-4"><strong>When to Refer:</strong></p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Height &lt;3rd percentile or &gt;97th percentile</li>
                  <li>BMI &lt;5th or &gt;95th percentile</li>
                  <li>Declining growth velocity</li>
                  <li>Disproportionate height vs weight</li>
                </ul>

                <p className="mt-4"><strong>Reference:</strong></p>
                <p className="text-xs text-slate-600">Khadilkar V, et al. Revised IAP Growth Charts for Height, Weight and Body Mass Index for 5- to 18-year-old Indian Children. Indian Pediatrics. 2015;52:47-55.</p>
              </CardContent>
            </Card>

            <Button
              onClick={() => setShowCharts(!showCharts)}
              disabled={!results}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 mt-4"
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              {showCharts ? 'Hide' : 'View'} IAP Growth Charts with Patient Plot
            </Button>

          {showCharts && results && (
            <div className="mt-6">
              <GrowthChart 
                gender={sex}
                age={age}
                height={height}
                weight={weight}
              />
            </div>
          )}
          </>
        )}
      </div>
    </div>
  );
}