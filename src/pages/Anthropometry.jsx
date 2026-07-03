import React, { useState } from "react";
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
import { ArrowLeft, Baby, Calculator, Activity, AlertTriangle, Info, CheckCircle } from "lucide-react";

// ─── Simple WHO Z-score calculation (LMS method, inline) ──────────────────────
// Approximated median/SD values for key indicators
const WHO_WAZ = {
  male:   { 0:3.35, 3:6.38, 6:7.93, 9:9.18, 12:10.17, 18:11.48, 24:12.55, 36:14.34, 48:16.31, 60:18.30 },
  female: { 0:3.23, 3:5.85, 6:7.30, 9:8.48, 12:9.53,  18:10.81, 24:11.89, 36:13.93, 48:15.96, 60:18.24 }
};
const WHO_WAZ_SD = {
  male:   { 0:0.49, 3:0.81, 6:1.01, 9:1.21, 12:1.37,  18:1.56,  24:1.68,  36:1.89,  48:2.17,  60:2.50 },
  female: { 0:0.46, 3:0.73, 6:0.95, 9:1.10, 12:1.30,  18:1.45,  24:1.56,  36:1.82,  48:2.13,  60:2.54 }
};
const WHO_HAZ = {
  male:   { 0:49.9, 3:61.4, 6:67.6, 9:72.8, 12:76.9,  18:84.2,  24:87.8,  36:96.1,  48:103.3, 60:110.0 },
  female: { 0:49.1, 3:59.8, 6:65.7, 9:71.0, 12:75.8,  18:83.2,  24:86.4,  36:95.1,  48:102.7, 60:109.4 }
};
const WHO_HAZ_SD = {
  male:   { 0:1.89, 3:2.04, 6:2.14, 9:2.27, 12:2.42,  18:2.67,  24:2.91,  36:3.38,  48:3.86,  60:4.35 },
  female: { 0:1.86, 3:2.25, 6:2.35, 9:2.51, 12:2.69,  18:2.93,  24:3.12,  36:3.62,  48:4.15,  60:4.64 }
};

function getInterpolated(table, ageMonths, sex) {
  const data = table[sex];
  const keys = Object.keys(data).map(Number).sort((a, b) => a - b);
  if (ageMonths <= keys[0]) return data[keys[0]];
  if (ageMonths >= keys[keys.length - 1]) return data[keys[keys.length - 1]];
  for (let i = 0; i < keys.length - 1; i++) {
    if (ageMonths >= keys[i] && ageMonths <= keys[i + 1]) {
      const t = (ageMonths - keys[i]) / (keys[i + 1] - keys[i]);
      return data[keys[i]] + t * (data[keys[i + 1]] - data[keys[i]]);
    }
  }
  return data[keys[0]];
}

function calcZ(value, median, sd) {
  if (!value || !median || !sd || sd === 0) return null;
  return Math.max(-4, Math.min(4, (value - median) / sd));
}

function zToPercentile(z) {
  if (z === null) return null;
  // Approximation
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const poly = t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  const phi = 1 - (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * z * z) * poly;
  return z >= 0 ? Math.round(phi * 100) : Math.round((1 - phi) * 100);
}

function interpretWAZ(z) {
  if (z === null) return { label: 'N/A', color: 'gray' };
  if (z < -3) return { label: 'Severe Underweight', color: 'red' };
  if (z < -2) return { label: 'Underweight', color: 'amber' };
  if (z > 2) return { label: 'Overweight', color: 'orange' };
  return { label: 'Normal', color: 'green' };
}
function interpretHAZ(z) {
  if (z === null) return { label: 'N/A', color: 'gray' };
  if (z < -3) return { label: 'Severe Stunting', color: 'red' };
  if (z < -2) return { label: 'Stunting', color: 'amber' };
  return { label: 'Normal', color: 'green' };
}
function interpretBMI(bmi, age) {
  if (age < 2) return { label: 'Not applicable <2y', color: 'gray' };
  // Fixed cutoffs are only screening approximations in children — BMI-for-age percentiles are definitive
  const caveat = age < 18 ? ' (screening — confirm on BMI-for-age chart)' : '';
  if (bmi < 14) return { label: 'Severely Thin' + caveat, color: 'red' };
  if (bmi < 16) return { label: 'Thin' + caveat, color: 'amber' };
  if (bmi < 25) return { label: 'Normal' + caveat, color: 'green' };
  if (bmi < 30) return { label: 'Overweight' + caveat, color: 'orange' };
  return { label: 'Obese' + caveat, color: 'red' };
}

const colorBadge = {
  red:    'bg-red-100 text-red-800 border-red-300',
  amber:  'bg-amber-100 text-amber-800 border-amber-300',
  green:  'bg-green-100 text-green-800 border-green-300',
  orange: 'bg-orange-100 text-orange-800 border-orange-300',
  gray:   'bg-gray-100 text-gray-700 border-gray-300',
};

export default function Anthropometry() {
  const [age, setAge] = useState("");
  const [ageUnit, setAgeUnit] = useState("years");
  const [sex, setSex] = useState("male");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [muac, setMuac] = useState("");
  const [headCirc, setHeadCirc] = useState("");
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState("summary");

  const handleCalculate = () => {
    if (!age || !weight || !height) return;
    const ageMonths = ageUnit === "years" ? parseFloat(age) * 12 : parseFloat(age);
    const ageYears = ageMonths / 12;
    const wt = parseFloat(weight);
    const ht = parseFloat(height);
    const htM = ht / 100;
    const bmi = wt / (htM * htM);
    const bsa = Math.sqrt((ht * wt) / 3600);
    // BMI-based IBW is an adult concept — only meaningful from adolescence
    const ibw = ageYears >= 12 ? 18.5 * htM * htM : null;

    // WHO 0–5y reference tables: z-scores are only valid up to 60 months
    const beyondWho = ageMonths > 60;
    let waz = null, haz = null;
    if (!beyondWho) {
      const wazMedian = getInterpolated(WHO_WAZ, ageMonths, sex);
      const wazSD = getInterpolated(WHO_WAZ_SD, ageMonths, sex);
      waz = calcZ(wt, wazMedian, wazSD);

      const hazMedian = getInterpolated(WHO_HAZ, ageMonths, sex);
      const hazSD = getInterpolated(WHO_HAZ_SD, ageMonths, sex);
      haz = calcZ(ht, hazMedian, hazSD);
    }

    const wazInterp = interpretWAZ(waz);
    const hazInterp = interpretHAZ(haz);
    const bmiInterp = interpretBMI(bmi, ageYears);

    // Nutrition action — MUAC is the primary SAM/MAM criterion (6–59 months); WAZ flags underweight
    const muacVal = parseFloat(muac);
    let nutritionAction = null;
    if (!isNaN(muacVal) && ageMonths >= 6 && ageMonths <= 60 && muacVal < 11.5) {
      nutritionAction = { level: "urgent", text: "Severe Acute Malnutrition (MUAC <11.5 cm) — RUTF/therapeutic feeding, admit if oedema or poor appetite." };
    } else if (!isNaN(muacVal) && ageMonths >= 6 && ageMonths <= 60 && muacVal < 12.5) {
      nutritionAction = { level: "moderate", text: "Moderate Acute Malnutrition (MUAC 11.5–12.5 cm) — supplementary feeding, close follow-up." };
    } else if (waz !== null && waz < -3) {
      nutritionAction = { level: "urgent", text: "Severely underweight (WAZ <−3) — assess for acute malnutrition (MUAC / weight-for-height), consider therapeutic feeding." };
    } else if (waz !== null && waz < -2) {
      nutritionAction = { level: "moderate", text: "Underweight (WAZ <−2) — high-calorie diet, supplementary feeding, micronutrient support." };
    } else if (haz !== null && haz < -2) {
      nutritionAction = { level: "mild", text: "Stunting detected — assess chronic illness, dietary diversity, micronutrient supplementation (zinc, iron, Vit A)." };
    }

    setResults({ ageMonths, ageYears, wt, ht, bmi, bsa, ibw, waz, haz, beyondWho, wazInterp, hazInterp, bmiInterp, nutritionAction });
  };

  const muacStatus = muac ? (
    parseFloat(muac) < 11.5 ? { label: "SAM (<11.5 cm)", color: "red" } :
    parseFloat(muac) < 12.5 ? { label: "MAM (11.5–12.5 cm)", color: "amber" } :
    { label: "Normal (>12.5 cm)", color: "green" }
  ) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <Link to={createPageUrl("ClinicalToolsHub")}>
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
        </Link>

        <div className="mb-5 flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-teal-500 to-green-600 rounded-xl flex items-center justify-center shadow">
            <Baby className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Pediatric Growth Assessment</h1>
            <p className="text-xs text-slate-500">WHO Z-score method · BMI · BSA · MUAC · Nutrition action</p>
          </div>
        </div>

        {/* Input Card */}
        <Card className="bg-white shadow-md mb-5 border border-teal-200">
          <CardHeader className="bg-teal-50 border-b py-3 px-5">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calculator className="w-4 h-4 text-teal-600" /> Patient Measurements
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="col-span-2 md:col-span-1">
                <Label className="text-xs font-semibold">Age *</Label>
                <div className="flex gap-2 mt-1">
                  <Input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="8" className="flex-1 text-sm" />
                  <Select value={ageUnit} onValueChange={setAgeUnit}>
                    <SelectTrigger className="w-24 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="years">Years</SelectItem>
                      <SelectItem value="months">Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs font-semibold">Sex *</Label>
                <Select value={sex} onValueChange={setSex}>
                  <SelectTrigger className="mt-1 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold">Weight (kg) *</Label>
                <Input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} placeholder="25" className="mt-1 text-sm" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Height/Length (cm) *</Label>
                <Input type="number" step="0.1" value={height} onChange={e => setHeight(e.target.value)} placeholder="110" className="mt-1 text-sm" />
              </div>
              <div>
                <Label className="text-xs font-semibold">MUAC (cm)</Label>
                <Input type="number" step="0.1" value={muac} onChange={e => setMuac(e.target.value)} placeholder="14 (optional)" className="mt-1 text-sm" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Head Circumference (cm)</Label>
                <Input type="number" step="0.1" value={headCirc} onChange={e => setHeadCirc(e.target.value)} placeholder="52 (optional)" className="mt-1 text-sm" />
              </div>
            </div>
            <Button onClick={handleCalculate} disabled={!age || !weight || !height}
              className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold">
              <Activity className="w-4 h-4 mr-2" /> Calculate Growth Indices
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {results && (
          <>
            {results.beyondWho && (
              <Alert className="mb-4 bg-amber-50 border-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <AlertDescription className="text-amber-800 text-xs">
                  <strong>Age &gt;5 years:</strong> WHO 0–5y growth-standard z-scores are not valid at this age and are not shown.
                  Use IAP/WHO 5–19y growth charts for weight-for-age, height-for-age and BMI percentiles.
                </AlertDescription>
              </Alert>
            )}
            {/* Quick summary row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {[
                { label: "BMI", value: results.bmi.toFixed(1), unit: "kg/m²" },
                { label: "BSA", value: results.bsa.toFixed(3), unit: "m² (Mosteller)" },
                { label: "Ideal Wt", value: results.ibw !== null ? results.ibw.toFixed(1) : "—", unit: results.ibw !== null ? "kg (BMI 18.5)" : "≥12y only" },
                { label: "Age", value: results.ageYears.toFixed(1), unit: `yrs (${results.ageMonths.toFixed(0)}m)` },
              ].map(({ label, value, unit }) => (
                <Card key={label} className="bg-white border border-slate-200 shadow-sm">
                  <CardContent className="p-3 text-center">
                    <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
                    <p className="text-lg font-bold text-slate-900">{value}</p>
                    <p className="text-xs text-slate-400">{unit}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* MUAC */}
            {muacStatus && (
              <Alert className={`mb-3 border ${colorBadge[muacStatus.color]}`}>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription className="font-semibold text-sm">
                  MUAC {muac} cm — {muacStatus.label}
                </AlertDescription>
              </Alert>
            )}

            {/* Nutrition action */}
            {results.nutritionAction && (
              <Alert className={`mb-4 border-2 ${results.nutritionAction.level === 'urgent' ? 'bg-red-50 border-red-300' : results.nutritionAction.level === 'moderate' ? 'bg-amber-50 border-amber-300' : 'bg-blue-50 border-blue-200'}`}>
                <Info className="w-4 h-4" />
                <AlertDescription className="font-medium text-sm">
                  <strong>Nutrition Action:</strong> {results.nutritionAction.text}
                </AlertDescription>
              </Alert>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full mb-4 grid grid-cols-3">
                <TabsTrigger value="summary">📊 Z-Scores</TabsTrigger>
                <TabsTrigger value="details">📋 Details</TabsTrigger>
                <TabsTrigger value="ref">📚 Reference</TabsTrigger>
              </TabsList>

              <TabsContent value="summary">
                <Card className="bg-white shadow-sm">
                  <CardContent className="p-5 space-y-4">
                    {/* Z-score cards */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Weight-for-Age", z: results.waz, interp: results.wazInterp },
                        { label: "Height-for-Age", z: results.haz, interp: results.hazInterp },
                      ].map(({ label, z, interp }) => {
                        const pctile = zToPercentile(z);
                        return (
                          <div key={label} className={`rounded-xl border-2 p-4 ${colorBadge[interp.color]}`}>
                            <p className="text-xs font-bold uppercase tracking-wide opacity-70">{label}</p>
                            <p className="text-3xl font-bold mt-1">
                              {z !== null ? (z >= 0 ? `+${z.toFixed(2)}` : z.toFixed(2)) : '—'}
                            </p>
                            {pctile !== null && <p className="text-xs opacity-80">{pctile}th percentile</p>}
                            <Badge className={`mt-2 text-xs border ${colorBadge[interp.color]}`}>{interp.label}</Badge>
                          </div>
                        );
                      })}
                    </div>

                    {/* BMI status */}
                    <div className={`rounded-xl border-2 p-4 ${colorBadge[results.bmiInterp.color]}`}>
                      <p className="text-xs font-bold uppercase tracking-wide opacity-70">BMI Status</p>
                      <p className="text-3xl font-bold mt-1">{results.bmi.toFixed(1)} <span className="text-base font-normal">kg/m²</span></p>
                      <Badge className={`mt-2 text-xs border ${colorBadge[results.bmiInterp.color]}`}>{results.bmiInterp.label}</Badge>
                    </div>

                    {/* WHO scale ref */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <p className="text-xs font-semibold text-slate-600 mb-2">WHO Z-Score Scale</p>
                      <div className="relative h-3 rounded-full overflow-hidden" style={{ background: "linear-gradient(to right, #ef4444, #f97316, #10b981, #f97316, #ef4444)" }}>
                        {[-2, 0, 2].map(ref => (
                          <div key={ref} className="absolute top-0 bottom-0 w-px bg-white opacity-70"
                            style={{ left: `${((ref + 4) / 8) * 100}%` }} />
                        ))}
                      </div>
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>-4 Severe</span><span>-2</span><span>0 Median</span><span>+2</span><span>+4</span>
                      </div>
                    </div>

                    {(!results.nutritionAction) && (
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <AlertDescription className="text-green-800">Growth parameters within normal range (WHO standards).</AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details">
                <Card className="bg-white shadow-sm">
                  <CardContent className="p-5">
                    <div className="space-y-3 text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          ["Age", `${results.ageYears.toFixed(2)} years (${results.ageMonths.toFixed(0)} months)`],
                          ["Weight", `${results.wt} kg`],
                          ["Height", `${results.ht} cm`],
                          ["BMI", `${results.bmi.toFixed(2)} kg/m²`],
                          ["BSA (Mosteller)", `${results.bsa.toFixed(4)} m²`],
                          ["Ideal Body Weight", results.ibw !== null ? `${results.ibw.toFixed(1)} kg` : "N/A (<12y)"],
                          ["WAZ", results.waz !== null ? results.waz.toFixed(2) : 'N/A'],
                          ["HAZ", results.haz !== null ? results.haz.toFixed(2) : 'N/A'],
                          ...(muac ? [["MUAC", `${muac} cm — ${muacStatus?.label}`]] : []),
                          ...(headCirc ? [["Head Circumference", `${headCirc} cm`]] : []),
                        ].map(([k, v]) => (
                          <div key={k} className="bg-slate-50 rounded p-2 border border-slate-200">
                            <p className="text-xs text-slate-500">{k}</p>
                            <p className="font-semibold text-slate-900 text-sm">{v}</p>
                          </div>
                        ))}
                      </div>
                      <Alert className="bg-blue-50 border-blue-200 mt-3">
                        <Info className="w-4 h-4 text-blue-600" />
                        <AlertDescription className="text-xs text-blue-800">
                          Drug dosing: use <strong>weight</strong> for most drugs; <strong>BSA</strong> for chemotherapy/cytotoxics.
                          IBW = Ideal Body Weight. Use whichever is clinically appropriate.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ref">
                <Card className="bg-white shadow-sm">
                  <CardContent className="p-5 space-y-4 text-sm">
                    <div>
                      <h3 className="font-bold text-slate-900 mb-2 text-sm">WHO Classification (Z-scores)</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-100">
                              <th className="border border-slate-300 p-2 text-left">Indicator</th>
                              <th className="border border-slate-300 p-2 text-red-700">Z &lt; -3 (Severe)</th>
                              <th className="border border-slate-300 p-2 text-amber-700">Z &lt; -2</th>
                              <th className="border border-slate-300 p-2 text-green-700">Normal</th>
                              <th className="border border-slate-300 p-2 text-orange-700">Z &gt; +2</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              ["WAZ (Weight-for-Age)", "Severe Underweight", "Underweight", "Normal", "—"],
                              ["HAZ (Height-for-Age)", "Severe Stunting", "Stunting", "Normal", "Tall for age"],
                              ["WHZ (Weight-for-Height)", "Severe Wasting (SAM)", "Wasting (MAM)", "Normal", "Overweight"],
                              ["BMI-for-Age", "Severely Thin", "Thin", "Normal", "Overweight/Obese"],
                            ].map(([ind, ...cells]) => (
                              <tr key={ind}>
                                <td className="border border-slate-300 p-2 font-medium">{ind}</td>
                                {cells.map((c, i) => <td key={i} className="border border-slate-300 p-2">{c}</td>)}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-2 text-sm">MUAC Classification</h3>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-red-50 border border-red-200 rounded p-2 text-center">
                          <strong className="text-red-800">&lt;11.5 cm</strong><br />SAM — Severe
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded p-2 text-center">
                          <strong className="text-amber-800">11.5–12.5 cm</strong><br />MAM — Moderate
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded p-2 text-center">
                          <strong className="text-green-800">&gt;12.5 cm</strong><br />Normal
                        </div>
                      </div>
                    </div>
                    <Alert className="bg-blue-50 border-blue-200">
                      <Info className="w-4 h-4 text-blue-600" />
                      <AlertDescription className="text-xs text-blue-800">
                        <strong>Reference:</strong> WHO Child Growth Standards (2006) for 0–5 years. BSA by Mosteller formula. Z-scores use interpolated WHO median ± SD values.
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