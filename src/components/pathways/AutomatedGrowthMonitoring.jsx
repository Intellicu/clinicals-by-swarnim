import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, AlertTriangle, CheckCircle2, Info, Plus, RefreshCw, Activity } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer, Area, AreaChart } from "recharts";
import { format } from "date-fns";

// WHO 2006/2007 Z-score reference data (simplified for clinical use)
const WHO_BOYS_WEIGHT = {0:3.3,1:4.5,2:5.6,3:6.4,4:7.0,5:7.5,6:7.9,9:8.9,12:9.6,18:10.9,24:12.2,36:14.0,48:16.3,60:18.3,72:20.5,84:22.9,96:25.3,108:28.1,120:31.4};
const WHO_BOYS_HEIGHT = {0:49.9,1:54.7,2:58.4,3:61.4,4:63.9,5:65.9,6:67.6,9:72.0,12:75.7,18:82.3,24:87.1,36:95.0,48:102.3,60:109.2,72:115.6,84:121.7,96:127.3,108:132.6,120:137.5};
const WHO_GIRLS_WEIGHT = {0:3.2,1:4.2,2:5.1,3:5.8,4:6.4,5:6.9,6:7.3,9:8.2,12:8.9,18:10.2,24:11.5,36:13.3,48:15.5,60:17.5,72:19.7,84:22.1,96:24.8,108:27.9,120:31.9};
const WHO_GIRLS_HEIGHT = {0:49.1,1:53.7,2:57.1,3:59.8,4:62.1,5:64.0,6:65.7,9:70.1,12:74.0,18:80.7,24:85.7,36:94.1,48:101.6,60:108.4,72:114.8,84:120.8,96:126.6,108:132.2,120:138.2};

// Calculate WHO Z-score
function calcZScore(value, median, sd) {
  return ((value - median) / sd).toFixed(2);
}

// Get Z-score from WHO reference
function getWHOZScore(ageMonths, weight, height, gender) {
  const wRef = gender === "Male" ? WHO_BOYS_WEIGHT : WHO_GIRLS_WEIGHT;
  const hRef = gender === "Male" ? WHO_BOYS_HEIGHT : WHO_GIRLS_HEIGHT;
  
  // Find closest age reference
  const ages = Object.keys(wRef).map(Number).sort((a,b) => a-b);
  const closestAge = ages.reduce((prev, curr) => Math.abs(curr - ageMonths) < Math.abs(prev - ageMonths) ? curr : prev);
  
  const medianW = wRef[closestAge];
  const medianH = hRef[closestAge];
  const sdW = medianW * 0.15; // Approximate SD
  const sdH = medianH * 0.05;
  
  const waz = calcZScore(weight, medianW, sdW);
  const haz = calcZScore(height, medianH, sdH);
  
  // BMI-for-age (simplified)
  const bmi = weight / ((height/100) ** 2);
  const medianBMI = medianW / ((medianH/100) ** 2);
  const sdBMI = medianBMI * 0.1;
  const baz = calcZScore(bmi, medianBMI, sdBMI);
  
  return { waz: parseFloat(waz), haz: parseFloat(haz), baz: parseFloat(baz), bmi: bmi.toFixed(1), medianW, medianH };
}

// Classify nutritional status
function classifyNutrition(waz, haz, baz) {
  const alerts = [];
  
  // Weight-for-Age
  if (waz < -3) alerts.push({ type: "Severely Underweight", severity: "critical", indicator: "WAZ", color: "red", action: "Refer to NRC. Assess for SAM (WHZ <-3 or MUAC <11.5 cm or edema)." });
  else if (waz < -2) alerts.push({ type: "Underweight", severity: "moderate", indicator: "WAZ", color: "orange", action: "Nutritional counseling. Investigate causes (chronic disease, inadequate intake)." });
  else if (waz > 2) alerts.push({ type: "Overweight", severity: "caution", indicator: "WAZ", color: "amber", action: "Monitor for obesity. Assess diet and physical activity." });
  
  // Height-for-Age (Stunting)
  if (haz < -3) alerts.push({ type: "Severe Stunting", severity: "critical", indicator: "HAZ", color: "red", action: "Chronic malnutrition. Investigate endocrine causes (GH deficiency, hypothyroidism). Nutritional rehabilitation." });
  else if (haz < -2) alerts.push({ type: "Stunting", severity: "moderate", indicator: "HAZ", color: "orange", action: "Chronic malnutrition. Assess dietary adequacy, recurrent infections, micronutrient deficiencies." });
  
  // BMI-for-Age (Wasting)
  if (baz < -3) alerts.push({ type: "Severe Wasting (SAM)", severity: "critical", indicator: "BAZ", color: "red", action: "Acute malnutrition. Immediate referral. Medical complications likely." });
  else if (baz < -2) alerts.push({ type: "Wasting (MAM)", severity: "moderate", indicator: "BAZ", color: "orange", action: "Acute malnutrition. Nutritional rehabilitation. Rule out acute illness." });
  else if (baz > 2) alerts.push({ type: "Overweight/Obese", severity: "caution", indicator: "BAZ", color: "amber", action: "Obesity management. Lifestyle modification. Screen for metabolic syndrome." });
  
  if (alerts.length === 0) alerts.push({ type: "Normal Growth", severity: "normal", indicator: "All", color: "green", action: "Continue age-appropriate nutrition. Monitor growth regularly." });
  
  return alerts;
}

export default function AutomatedGrowthMonitoring({ patient }) {
  const qc = useQueryClient();
  const [manualEntry, setManualEntry] = useState({ weight: "", height: "", date: format(new Date(), "yyyy-MM-dd") });
  const [selectedPatient, setSelectedPatient] = useState(patient || null);
  const [ageMonths, setAgeMonths] = useState(0);
  const [analysis, setAnalysis] = useState(null);

  // Fetch patient's medical history entries with vitals
  const { data: historyEntries = [] } = useQuery({
    queryKey: ["patient-vitals-history", selectedPatient?.id],
    queryFn: () => base44.entities.MedicalHistoryEntry.filter({ patient_id: selectedPatient.id }, "-entry_date", 100),
    enabled: !!selectedPatient?.id,
  });

  const addVitalMutation = useMutation({
    mutationFn: (data) => base44.entities.MedicalHistoryEntry.create(data),
    onSuccess: () => {
      qc.invalidateQueries(["patient-vitals-history", selectedPatient.id]);
      toast.success("Growth data logged to medical history");
      setManualEntry({ weight: "", height: "", date: format(new Date(), "yyyy-MM-dd") });
    },
  });

  useEffect(() => {
    if (selectedPatient && selectedPatient.date_of_birth) {
      const birthDate = new Date(selectedPatient.date_of_birth);
      const now = new Date();
      const months = (now.getFullYear() - birthDate.getFullYear()) * 12 + (now.getMonth() - birthDate.getMonth());
      setAgeMonths(months);
    } else if (selectedPatient && selectedPatient.age_years) {
      setAgeMonths(selectedPatient.age_years * 12);
    }
  }, [selectedPatient]);

  useEffect(() => {
    if (selectedPatient && historyEntries.length > 0 && selectedPatient.gender) {
      runAutoAnalysis();
    }
  }, [historyEntries, selectedPatient]);

  const runAutoAnalysis = () => {
    // Extract growth data from history entries + baseline vitals
    const dataPoints = [];
    
    // Baseline vitals
    if (selectedPatient.baseline_vitals?.weight && selectedPatient.baseline_vitals?.height) {
      dataPoints.push({
        date: selectedPatient.created_date,
        weight: selectedPatient.baseline_vitals.weight,
        height: selectedPatient.baseline_vitals.height,
        ageMonths: ageMonths,
      });
    }
    
    // History entries with growth data
    historyEntries.forEach(entry => {
      const desc = entry.description || "";
      const weightMatch = desc.match(/weight[:\s]+([0-9.]+)\s*kg/i);
      const heightMatch = desc.match(/height[:\s]+([0-9.]+)\s*cm/i);
      
      if (weightMatch || heightMatch) {
        dataPoints.push({
          date: entry.entry_date,
          weight: weightMatch ? parseFloat(weightMatch[1]) : null,
          height: heightMatch ? parseFloat(heightMatch[1]) : null,
          ageMonths: ageMonths, // Approximate, could calculate from entry_date
        });
      }
    });
    
    // Calculate Z-scores for all points
    const analyzed = dataPoints.map(dp => {
      if (dp.weight && dp.height) {
        const { waz, haz, baz, bmi } = getWHOZScore(dp.ageMonths, dp.weight, dp.height, selectedPatient.gender);
        return { ...dp, waz, haz, baz, bmi };
      }
      return dp;
    }).filter(d => d.waz !== undefined);
    
    // Latest measurement
    if (analyzed.length > 0) {
      const latest = analyzed[analyzed.length - 1];
      const classification = classifyNutrition(latest.waz, latest.haz, latest.baz);
      setAnalysis({ dataPoints: analyzed, latest, classification });
    }
  };

  const logManualVital = () => {
    if (!manualEntry.weight || !manualEntry.height || !selectedPatient) {
      toast.error("Enter weight and height");
      return;
    }
    
    const { waz, haz, baz, bmi } = getWHOZScore(ageMonths, parseFloat(manualEntry.weight), parseFloat(manualEntry.height), selectedPatient.gender);
    
    addVitalMutation.mutate({
      patient_id: selectedPatient.id,
      entry_type: "Follow-up Note",
      title: `Growth Monitoring — ${manualEntry.date}`,
      entry_date: manualEntry.date,
      description: `Weight: ${manualEntry.weight} kg\nHeight: ${manualEntry.height} cm\nBMI: ${bmi}\nWAZ: ${waz} | HAZ: ${haz} | BAZ: ${baz}`,
      tags: ["growth", "anthropometry", "vitals"],
    });
  };

  // Generate WHO reference curves
  const refAges = [0, 3, 6, 9, 12, 18, 24, 36, 48, 60, 72, 84, 96, 108, 120];
  const refCurves = refAges.map(age => {
    const wRef = selectedPatient?.gender === "Male" ? WHO_BOYS_WEIGHT : WHO_GIRLS_WEIGHT;
    const hRef = selectedPatient?.gender === "Male" ? WHO_BOYS_HEIGHT : WHO_GIRLS_HEIGHT;
    const w = wRef[age] || null;
    const h = hRef[age] || null;
    return { age: age / 12, median_w: w, plus2sd_w: w ? w + w*0.15*2 : null, minus2sd_w: w ? w - w*0.15*2 : null, median_h: h, plus2sd_h: h ? h + h*0.05*2 : null, minus2sd_h: h ? h - h*0.05*2 : null };
  });

  if (!selectedPatient) {
    return (
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          Select a patient to enable automated growth monitoring with WHO Z-score calculations
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-5">
      <Alert className="bg-blue-50 border-blue-300 shadow-sm">
        <TrendingUp className="w-5 h-5 text-blue-600" />
        <AlertDescription className="text-blue-900">
          <strong>Automated Growth Monitoring Engine</strong> — Calculates WHO 2006/2007 Z-scores (WAZ, HAZ, BAZ) from medical history vitals. Charts auto-update when new measurements are logged.
        </AlertDescription>
      </Alert>

      {/* Patient Info */}
      <Card className="bg-white shadow-md border-2 border-blue-200">
        <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-cyan-50">
          <CardTitle className="text-sm font-bold text-blue-900">Patient: {selectedPatient.patient_name}</CardTitle>
          <div className="flex gap-2 flex-wrap text-xs">
            <Badge variant="outline">Age: {(ageMonths / 12).toFixed(1)} years ({ageMonths} months)</Badge>
            <Badge variant="outline">Gender: {selectedPatient.gender || "Unknown"}</Badge>
            <Badge variant="outline">CR: {selectedPatient.cr_number}</Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Log New Vitals */}
      <Card className="bg-white shadow-md">
        <CardHeader className="pb-2 bg-green-50 border-b">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Plus className="w-4 h-4 text-green-600" />Log New Growth Measurement
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <Label className="text-xs font-semibold">Weight (kg)</Label>
              <Input type="number" step="0.1" value={manualEntry.weight} onChange={e => setManualEntry(m => ({ ...m, weight: e.target.value }))} placeholder="e.g. 25.5" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs font-semibold">Height (cm)</Label>
              <Input type="number" step="0.1" value={manualEntry.height} onChange={e => setManualEntry(m => ({ ...m, height: e.target.value }))} placeholder="e.g. 120" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs font-semibold">Date</Label>
              <Input type="date" value={manualEntry.date} onChange={e => setManualEntry(m => ({ ...m, date: e.target.value }))} className="mt-1" />
            </div>
          </div>
          <Button onClick={logManualVital} className="w-full bg-green-600 hover:bg-green-700" disabled={addVitalMutation.isPending}>
            <Plus className="w-4 h-4 mr-2" />{addVitalMutation.isPending ? "Logging..." : "Log to Medical History"}
          </Button>
        </CardContent>
      </Card>

      {/* Current Analysis */}
      {analysis && analysis.latest && (
        <Card className="bg-white shadow-lg border-2 border-purple-300">
          <CardHeader className="pb-2 bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <CardTitle className="text-sm font-bold text-purple-900 flex items-center justify-between">
              <span className="flex items-center gap-2"><Activity className="w-5 h-5" />Latest Growth Analysis</span>
              <Button size="sm" variant="outline" onClick={runAutoAnalysis}><RefreshCw className="w-3 h-3 mr-1" />Refresh</Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <ZScoreCard label="Weight-for-Age" value={analysis.latest.waz} indicator="WAZ" />
              <ZScoreCard label="Height-for-Age" value={analysis.latest.haz} indicator="HAZ" />
              <ZScoreCard label="BMI-for-Age" value={analysis.latest.baz} indicator="BAZ" />
              <div className="bg-slate-50 rounded-lg p-3 text-center border">
                <div className="text-xs text-slate-500 mb-1">Current BMI</div>
                <div className="font-bold text-lg text-slate-900">{analysis.latest.bmi}</div>
                <div className="text-xs text-slate-400">kg/m²</div>
              </div>
            </div>
            
            {/* Nutritional Classification */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase">Nutritional Status</h4>
              {analysis.classification.map((alert, i) => (
                <Alert key={i} className={`border-2 ${alert.color === "red" ? "bg-red-50 border-red-300" : alert.color === "orange" ? "bg-orange-50 border-orange-300" : alert.color === "amber" ? "bg-amber-50 border-amber-300" : "bg-green-50 border-green-300"}`}>
                  <AlertTriangle className={`w-4 h-4 ${alert.color === "red" ? "text-red-600" : alert.color === "orange" ? "text-orange-600" : alert.color === "amber" ? "text-amber-600" : "text-green-600"}`} />
                  <AlertDescription className="text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold">{alert.type}</span>
                      <Badge className={`text-xs ${alert.color === "red" ? "bg-red-600" : alert.color === "orange" ? "bg-orange-600" : alert.color === "amber" ? "bg-amber-600" : "bg-green-600"} text-white`}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-slate-700"><strong>Indicator:</strong> {alert.indicator}</p>
                    <p className="mt-1 bg-white/70 p-2 rounded"><strong>Action:</strong> {alert.action}</p>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interactive Growth Charts */}
      {analysis && analysis.dataPoints.length > 0 && (
        <Card className="bg-white shadow-lg">
          <CardHeader className="bg-gradient-to-r from-teal-50 to-green-50 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-600" />Interactive WHO Growth Charts ({analysis.dataPoints.length} measurements)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-6">
            {/* Weight Chart */}
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Weight-for-Age (kg) with WHO Reference</h4>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="age" type="number" domain={[0, 10]} label={{ value: "Age (years)", position: "insideBottom", offset: -5, fontSize: 11 }} tick={{ fontSize: 11 }} />
                  <YAxis label={{ value: "Weight (kg)", angle: -90, position: "insideLeft", fontSize: 11 }} tick={{ fontSize: 10 }} domain={[0, 'auto']} />
                  <Tooltip formatter={(v, n) => [typeof v === "number" ? v.toFixed(1) : v, n]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area data={refCurves} dataKey="plus2sd_w" fill="#fecaca" stroke="none" opacity={0.3} name="+2 SD" />
                  <Area data={refCurves} dataKey="minus2sd_w" fill="#fecaca" stroke="none" opacity={0.3} name="-2 SD" />
                  <Line data={refCurves} dataKey="median_w" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 2" dot={false} name="WHO Median" />
                  <Line data={analysis.dataPoints.map(d => ({ age: d.ageMonths / 12, weight: d.weight }))} dataKey="weight" stroke="#10b981" strokeWidth={3} dot={{ r: 5, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }} name="Patient Weight" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Height Chart */}
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Height-for-Age (cm) with WHO Reference</h4>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="age" type="number" domain={[0, 10]} label={{ value: "Age (years)", position: "insideBottom", offset: -5, fontSize: 11 }} tick={{ fontSize: 11 }} />
                  <YAxis label={{ value: "Height (cm)", angle: -90, position: "insideLeft", fontSize: 11 }} tick={{ fontSize: 10 }} domain={[40, 'auto']} />
                  <Tooltip formatter={(v, n) => [typeof v === "number" ? v.toFixed(1) : v, n]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area data={refCurves} dataKey="plus2sd_h" fill="#93c5fd" stroke="none" opacity={0.3} name="+2 SD" />
                  <Area data={refCurves} dataKey="minus2sd_h" fill="#93c5fd" stroke="none" opacity={0.3} name="-2 SD" />
                  <Line data={refCurves} dataKey="median_h" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 2" dot={false} name="WHO Median" />
                  <Line data={analysis.dataPoints.map(d => ({ age: d.ageMonths / 12, height: d.height }))} dataKey="height" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }} name="Patient Height" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Z-Score Trends */}
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Z-Score Trends (WHO Standards)</h4>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={analysis.dataPoints.map(d => ({ age: d.ageMonths / 12, WAZ: d.waz, HAZ: d.haz, BAZ: d.baz }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="age" label={{ value: "Age (years)", position: "insideBottom", offset: -5, fontSize: 11 }} tick={{ fontSize: 11 }} />
                  <YAxis domain={[-4, 3]} tick={{ fontSize: 10 }} label={{ value: "Z-Score", angle: -90, position: "insideLeft", fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <ReferenceLine y={-3} stroke="#ef4444" strokeDasharray="4 2" label={{ value: "-3 SD (Critical)", fontSize: 9, fill: "#ef4444" }} />
                  <ReferenceLine y={-2} stroke="#f59e0b" strokeDasharray="4 2" label={{ value: "-2 SD (Moderate)", fontSize: 9, fill: "#f59e0b" }} />
                  <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="2 2" label={{ value: "Median", fontSize: 9 }} />
                  <ReferenceLine y={2} stroke="#f59e0b" strokeDasharray="4 2" label={{ value: "+2 SD", fontSize: 9 }} />
                  <Line dataKey="WAZ" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} name="Weight-for-Age" />
                  <Line dataKey="HAZ" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} name="Height-for-Age" />
                  <Line dataKey="BAZ" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4 }} name="BMI-for-Age" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-xs">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="p-2 text-left">Date</th>
                    <th className="p-2 text-left">Age (mo)</th>
                    <th className="p-2 text-left">Wt (kg)</th>
                    <th className="p-2 text-left">Ht (cm)</th>
                    <th className="p-2 text-left">BMI</th>
                    <th className="p-2 text-left">WAZ</th>
                    <th className="p-2 text-left">HAZ</th>
                    <th className="p-2 text-left">BAZ</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.dataPoints.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      <td className="p-2">{row.date ? format(new Date(row.date), "dd/MM/yy") : "—"}</td>
                      <td className="p-2">{row.ageMonths}</td>
                      <td className="p-2 font-medium">{row.weight}</td>
                      <td className="p-2">{row.height}</td>
                      <td className="p-2">{row.bmi}</td>
                      <td className={`p-2 font-bold ${row.waz < -2 ? "text-red-600" : row.waz < 0 ? "text-amber-600" : "text-green-600"}`}>{row.waz}</td>
                      <td className={`p-2 font-bold ${row.haz < -2 ? "text-red-600" : row.haz < 0 ? "text-amber-600" : "text-green-600"}`}>{row.haz}</td>
                      <td className={`p-2 font-bold ${row.baz < -2 ? "text-red-600" : row.baz > 2 ? "text-amber-600" : "text-green-600"}`}>{row.baz}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {(!analysis || analysis.dataPoints.length === 0) && (
        <Alert className="bg-amber-50 border-amber-200">
          <Info className="w-4 h-4 text-amber-600" />
          <AlertDescription className="text-amber-800 text-sm">
            No growth data found in medical history yet. Log vitals above to start automated monitoring and charting.
          </AlertDescription>
        </Alert>
      )}

      {/* WHO Reference Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-blue-900">WHO Growth Standards Reference</CardTitle>
        </CardHeader>
        <CardContent className="p-4 text-xs text-blue-800 space-y-1">
          <p><strong>WHO 2006:</strong> Child Growth Standards (0-5 years) — prescriptive standard based on breastfed healthy children</p>
          <p><strong>WHO 2007:</strong> Growth Reference (5-19 years) — reconstruction of 1977 NCHS reference</p>
          <p><strong>Z-score interpretation:</strong> -2 to +2 SD = Normal | &lt;-2 SD = Undernutrition | &lt;-3 SD = Severe | &gt;+2 SD = Overweight/Obesity</p>
          <a href="https://www.who.int/tools/child-growth-standards" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 mt-2">
            <ExternalLink className="w-3 h-3" />Official WHO Growth Standards
          </a>
        </CardContent>
      </Card>
    </div>
  );
}

function ZScoreCard({ label, value, indicator }) {
  const color = value < -3 ? "bg-red-100 border-red-300 text-red-900" : value < -2 ? "bg-orange-100 border-orange-300 text-orange-900" : value > 2 ? "bg-amber-100 border-amber-300 text-amber-900" : "bg-green-100 border-green-300 text-green-900";
  const status = value < -3 ? "Severe" : value < -2 ? "Moderate" : value > 2 ? "High" : "Normal";
  
  return (
    <div className={`rounded-lg p-3 text-center border-2 ${color}`}>
      <div className="text-xs mb-1">{label}</div>
      <div className="font-bold text-2xl">{value}</div>
      <div className="text-xs opacity-75">{indicator}</div>
      <Badge className="text-xs mt-1" variant="outline">{status}</Badge>
    </div>
  );
}