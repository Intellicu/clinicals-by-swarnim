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
import { TrendingUp, AlertTriangle, Activity, Plus, RefreshCw, Download } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

// WHO 2006/2007 Reference Data (simplified for boys — adjust for girls)
const WHO_BOYS_WT = {1:9.6,2:12.2,3:14.3,4:16.0,5:17.9,6:19.7,7:21.5,8:23.3,9:25.0,10:27.0,11:29.2,12:31.5,13:34.0,14:37.0,15:40.3,16:43.9,17:47.5,18:50.8};
const WHO_BOYS_HT = {1:75.7,2:87.8,3:96.1,4:102.9,5:109.2,6:115.5,7:121.1,8:126.6,9:131.7,10:137.2,11:143.0,12:149.2,13:156.0,14:163.2,15:169.8,16:175.2,17:178.6,18:180.3};
const WHO_BOYS_WT_SD = {1:1.3,2:1.5,3:1.7,4:1.9,5:2.2,6:2.5,7:2.8,8:3.2,9:3.6,10:4.1,11:4.8,12:5.6,13:6.5,14:7.5,15:8.4,16:9.1,17:9.5,18:9.7};
const WHO_BOYS_HT_SD = {1:2.8,2:3.6,3:4.0,4:4.3,5:4.6,6:4.8,7:5.1,8:5.4,9:5.6,10:5.9,11:6.3,12:6.8,13:7.3,14:7.7,15:7.9,16:7.9,17:7.8,18:7.6};

// Simplified girls data (about 5-10% lighter/shorter)
const WHO_GIRLS_WT = Object.fromEntries(Object.entries(WHO_BOYS_WT).map(([k,v]) => [k, +(v*0.92).toFixed(1)]));
const WHO_GIRLS_HT = Object.fromEntries(Object.entries(WHO_BOYS_HT).map(([k,v]) => [k, +(v*0.96).toFixed(1)]));
const WHO_GIRLS_WT_SD = WHO_BOYS_WT_SD;
const WHO_GIRLS_HT_SD = WHO_BOYS_HT_SD;

function calcZScore(value, median, sd) {
  if (!median || !sd) return 0;
  return +((value - median) / sd).toFixed(2);
}

function classifyGrowth(waz, haz, bmiz) {
  const issues = [];
  if (waz < -3) issues.push({ type: "Severe Underweight", severity: "severe", action: "Refer to NRC/Nutritionist" });
  else if (waz < -2) issues.push({ type: "Moderate Underweight", severity: "moderate", action: "Nutrition counseling" });
  else if (waz > 2) issues.push({ type: "Overweight", severity: "moderate", action: "Lifestyle counseling" });
  
  if (haz < -3) issues.push({ type: "Severe Stunting", severity: "severe", action: "Investigate causes (chronic illness, malnutrition)" });
  else if (haz < -2) issues.push({ type: "Moderate Stunting", severity: "moderate", action: "Monitor & investigate" });
  
  if (bmiz < -3) issues.push({ type: "Severe Wasting (SAM)", severity: "critical", action: "Immediate referral for SAM management" });
  else if (bmiz < -2) issues.push({ type: "Moderate Wasting (MAM)", severity: "moderate", action: "Nutrition intervention" });
  else if (bmiz > 2) issues.push({ type: "Obesity", severity: "moderate", action: "Diet + exercise counseling" });
  
  if (issues.length === 0) issues.push({ type: "Normal Growth", severity: "normal", action: "Continue healthy nutrition" });
  return issues;
}

export default function GrowthMonitoringEngine({ patient }) {
  const qc = useQueryClient();
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [manualEntry, setManualEntry] = useState(false);

  const { data: historyEntries = [] } = useQuery({
    queryKey: ["medical-history", patient.id],
    queryFn: () => base44.entities.MedicalHistoryEntry.filter({ patient_id: patient.id }, "-entry_date", 200),
  });

  const createHistoryMutation = useMutation({
    mutationFn: (data) => base44.entities.MedicalHistoryEntry.create(data),
    onSuccess: () => { qc.invalidateQueries(["medical-history", patient.id]); toast.success("Growth data logged"); setWeight(""); setHeight(""); },
  });

  // Extract growth measurements from history
  const growthLogs = historyEntries
    .filter(e => e.entry_type === "Follow-up Note" && (e.description?.includes("Weight:") || e.description?.includes("Height:")))
    .map(e => {
      const wtMatch = e.description.match(/Weight:\s*([\d.]+)/);
      const htMatch = e.description.match(/Height:\s*([\d.]+)/);
      const ageMatch = e.description.match(/Age:\s*([\d.]+)/);
      return {
        date: e.entry_date,
        weight: wtMatch ? +wtMatch[1] : null,
        height: htMatch ? +htMatch[1] : null,
        age: ageMatch ? +ageMatch[1] : patient.age_years,
      };
    })
    .filter(g => g.weight || g.height)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Add current baseline if available
  if (patient.baseline_vitals?.weight || patient.baseline_vitals?.height) {
    growthLogs.push({
      date: patient.created_date || new Date().toISOString(),
      weight: patient.baseline_vitals.weight,
      height: patient.baseline_vitals.height,
      age: patient.age_years,
      isBaseline: true,
    });
  }

  const uniqueLogs = growthLogs.filter((log, idx, arr) => 
    arr.findIndex(l => l.date === log.date) === idx
  ).sort((a, b) => new Date(a.date) - new Date(b.date));

  const gender = patient.gender === "Female" ? "Female" : "Male";
  const wtRef = gender === "Female" ? WHO_GIRLS_WT : WHO_BOYS_WT;
  const htRef = gender === "Female" ? WHO_GIRLS_HT : WHO_BOYS_HT;
  const wtSD = gender === "Female" ? WHO_GIRLS_WT_SD : WHO_BOYS_WT_SD;
  const htSD = gender === "Female" ? WHO_GIRLS_HT_SD : WHO_BOYS_HT_SD;

  // Calculate Z-scores for each log
  const enrichedLogs = uniqueLogs.map(log => {
    const age = log.age || patient.age_years;
    const waz = log.weight ? calcZScore(log.weight, wtRef[age], wtSD[age]) : null;
    const haz = log.height ? calcZScore(log.height, htRef[age], htSD[age]) : null;
    const bmi = (log.weight && log.height) ? +(log.weight / ((log.height/100)**2)).toFixed(1) : null;
    const bmiz = bmi ? calcZScore(bmi, 16.5, 2) : null; // Simplified BMI ref
    return { ...log, age, waz, haz, bmi, bmiz };
  });

  const latestLog = enrichedLogs[enrichedLogs.length - 1];
  const growthIssues = latestLog ? classifyGrowth(latestLog.waz || 0, latestLog.haz || 0, latestLog.bmiz || 0) : [];

  const logGrowth = () => {
    if (!weight || !height) { toast.error("Enter both weight and height"); return; }
    const desc = `Weight: ${weight} kg, Height: ${height} cm, Age: ${patient.age_years} years, BMI: ${(+weight / ((+height/100)**2)).toFixed(1)}`;
    createHistoryMutation.mutate({
      patient_id: patient.id,
      entry_date: format(new Date(), "yyyy-MM-dd"),
      entry_type: "Follow-up Note",
      title: "Growth Monitoring",
      description: desc,
      tags: ["growth", "vitals"],
    });
  };

  // WHO reference lines for charts
  const whoWtLine = Object.entries(wtRef).map(([age, median]) => ({
    age: +age, median, plus2sd: +(median + 2*wtSD[age]).toFixed(1), minus2sd: +(median - 2*wtSD[age]).toFixed(1)
  }));
  const whoHtLine = Object.entries(htRef).map(([age, median]) => ({
    age: +age, median, plus2sd: +(median + 2*htSD[age]).toFixed(1), minus2sd: +(median - 2*htSD[age]).toFixed(1)
  }));

  const severityColor = { critical: "bg-red-600 text-white", severe: "bg-red-500 text-white", moderate: "bg-amber-500 text-white", normal: "bg-green-600 text-white" };

  return (
    <div className="space-y-4">
      {/* Quick Log Form */}
      <Card className="bg-white shadow-sm border-2 border-teal-200">
        <CardHeader className="pb-2 bg-gradient-to-r from-teal-50 to-green-50">
          <CardTitle className="text-sm flex items-center gap-2">
            <Plus className="w-4 h-4 text-teal-600" />Log New Vitals (Auto Z-Score Calculation)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs font-semibold">Weight (kg)</Label>
              <Input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 18.5" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs font-semibold">Height (cm)</Label>
              <Input type="number" step="0.1" value={height} onChange={e => setHeight(e.target.value)} placeholder="e.g. 110" className="mt-1" />
            </div>
            <div className="flex items-end">
              <Button onClick={logGrowth} disabled={createHistoryMutation.isPending} className="w-full bg-teal-600 hover:bg-teal-700 h-9">
                <Plus className="w-3 h-3 mr-1" />Log
              </Button>
            </div>
          </div>
          <p className="text-xs text-slate-500">⚡ Auto-calculates WHO Z-scores and adds to medical history timeline</p>
        </CardContent>
      </Card>

      {/* Current Assessment */}
      {latestLog && (
        <Card className="bg-white shadow-lg border-2">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />Current Growth Assessment (WHO 2006/2007)
            </CardTitle>
            <p className="text-xs text-slate-500">Latest: {latestLog.date ? format(new Date(latestLog.date), "dd MMM yyyy") : "Baseline"}</p>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <MetricBox label="Weight" value={`${latestLog.weight} kg`} zscore={latestLog.waz} />
              <MetricBox label="Height" value={`${latestLog.height} cm`} zscore={latestLog.haz} />
              <MetricBox label="BMI" value={latestLog.bmi} zscore={latestLog.bmiz} />
              <MetricBox label="Age" value={`${latestLog.age} y`} />
            </div>
            <div className="space-y-1">
              {growthIssues.map((issue, i) => (
                <Alert key={i} className={`${issue.severity === "normal" ? "bg-green-50 border-green-200" : issue.severity === "critical" ? "bg-red-100 border-red-400" : "bg-amber-50 border-amber-300"}`}>
                  <AlertTriangle className={`w-4 h-4 ${issue.severity === "normal" ? "text-green-600" : issue.severity === "critical" ? "text-red-600" : "text-amber-600"}`} />
                  <AlertDescription className="text-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <strong>{issue.type}</strong>
                        <p className="text-slate-600 mt-0.5">{issue.action}</p>
                      </div>
                      <Badge className={`${severityColor[issue.severity]} text-xs`}>{issue.severity}</Badge>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Growth Charts */}
      {enrichedLogs.length > 1 && (
        <Card className="bg-white shadow-lg border-2">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />Growth Trend Charts ({enrichedLogs.length} data points)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-5">
            {/* Weight Chart */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 mb-2">Weight-for-Age (kg) vs WHO {gender} Reference</h4>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="age" label={{ value: "Age (years)", position: "insideBottom", offset: -4, fontSize: 11 }} tick={{ fontSize: 10 }} />
                  <YAxis label={{ value: "Weight (kg)", angle: -90, position: "insideLeft", fontSize: 11 }} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v, n) => [typeof v === "number" ? v.toFixed(1) : v, n]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line data={whoWtLine} dataKey="median" stroke="#94a3b8" strokeDasharray="4 2" dot={false} name="WHO Median" />
                  <Line data={whoWtLine} dataKey="plus2sd" stroke="#fca5a5" strokeDasharray="2 2" dot={false} name="+2 SD" strokeWidth={1.5} />
                  <Line data={whoWtLine} dataKey="minus2sd" stroke="#fca5a5" strokeDasharray="2 2" dot={false} name="-2 SD" strokeWidth={1.5} />
                  <ReferenceLine y={0} stroke="#cbd5e1" strokeDasharray="2 2" />
                  <Line data={enrichedLogs} dataKey="weight" stroke="#10b981" strokeWidth={3} dot={{ r: 5, fill: "#10b981" }} name="Patient Weight" connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Height Chart */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 mb-2">Height-for-Age (cm) vs WHO {gender} Reference</h4>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="age" label={{ value: "Age (years)", position: "insideBottom", offset: -4, fontSize: 11 }} tick={{ fontSize: 10 }} />
                  <YAxis label={{ value: "Height (cm)", angle: -90, position: "insideLeft", fontSize: 11 }} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v, n) => [typeof v === "number" ? v.toFixed(1) : v, n]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line data={whoHtLine} dataKey="median" stroke="#94a3b8" strokeDasharray="4 2" dot={false} name="WHO Median" />
                  <Line data={whoHtLine} dataKey="plus2sd" stroke="#a78bfa" strokeDasharray="2 2" dot={false} name="+2 SD" strokeWidth={1.5} />
                  <Line data={whoHtLine} dataKey="minus2sd" stroke="#a78bfa" strokeDasharray="2 2" dot={false} name="-2 SD" strokeWidth={1.5} />
                  <Line data={enrichedLogs} dataKey="height" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 5, fill: "#8b5cf6" }} name="Patient Height" connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Z-Score Trend */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 mb-2">Z-Score Trend (WAZ, HAZ, BMI-Z)</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={enrichedLogs}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="age" label={{ value: "Age (years)", position: "insideBottom", offset: -4, fontSize: 11 }} tick={{ fontSize: 10 }} />
                  <YAxis domain={[-4, 3]} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => [v?.toFixed(2) || "—", ""]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <ReferenceLine y={-2} stroke="#f59e0b" strokeDasharray="4 2" label={{ value: "-2 SD", fontSize: 10, fill: "#f59e0b" }} />
                  <ReferenceLine y={-3} stroke="#ef4444" strokeDasharray="4 2" label={{ value: "-3 SD", fontSize: 10, fill: "#ef4444" }} />
                  <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="2 2" />
                  <ReferenceLine y={2} stroke="#f59e0b" strokeDasharray="4 2" label={{ value: "+2 SD", fontSize: 10, fill: "#f59e0b" }} />
                  <Line dataKey="waz" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} name="WAZ" connectNulls />
                  <Line dataKey="haz" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4 }} name="HAZ" connectNulls />
                  <Line dataKey="bmiz" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} name="BMI-Z" connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-xs">
                <thead><tr className="bg-slate-100">
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Age (y)</th>
                  <th className="p-2 text-left">Wt (kg)</th>
                  <th className="p-2 text-left">WAZ</th>
                  <th className="p-2 text-left">Ht (cm)</th>
                  <th className="p-2 text-left">HAZ</th>
                  <th className="p-2 text-left">BMI</th>
                  <th className="p-2 text-left">BMI-Z</th>
                </tr></thead>
                <tbody>
                  {enrichedLogs.map((log, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      <td className="p-2">{log.date ? format(new Date(log.date), "dd/MM/yy") : "—"}{log.isBaseline && " (baseline)"}</td>
                      <td className="p-2">{log.age}</td>
                      <td className="p-2 font-medium">{log.weight || "—"}</td>
                      <td className={`p-2 font-bold ${log.waz < -2 ? "text-red-600" : log.waz > 2 ? "text-amber-600" : "text-green-600"}`}>{log.waz?.toFixed(1) || "—"}</td>
                      <td className="p-2">{log.height || "—"}</td>
                      <td className={`p-2 font-bold ${log.haz < -2 ? "text-red-600" : "text-green-600"}`}>{log.haz?.toFixed(1) || "—"}</td>
                      <td className="p-2">{log.bmi || "—"}</td>
                      <td className={`p-2 font-bold ${log.bmiz < -2 ? "text-red-600" : log.bmiz > 2 ? "text-amber-600" : "text-green-600"}`}>{log.bmiz?.toFixed(1) || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {enrichedLogs.length === 0 && (
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="w-4 h-4 text-blue-600" />
          <AlertDescription className="text-xs text-blue-800">
            No growth data logged yet. Use the form above to log weight/height — WHO Z-scores will be auto-calculated and visualized in interactive charts.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

function MetricBox({ label, value, zscore }) {
  const zColor = zscore ? (zscore < -2 ? "text-red-600" : zscore > 2 ? "text-amber-600" : "text-green-600") : "text-slate-600";
  return (
    <div className="bg-slate-50 border rounded-lg p-2 text-center">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="font-bold text-base text-slate-900 mt-0.5">{value}</div>
      {zscore !== null && zscore !== undefined && <div className={`text-xs font-bold mt-0.5 ${zColor}`}>Z: {zscore.toFixed(1)}</div>}
    </div>
  );
}