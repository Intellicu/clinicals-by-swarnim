import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, TrendingDown, TrendingUp, Activity, Baby, Plus, Loader2, Brain } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { toast } from "sonner";

// WHO Weight-for-Age median and SD values (boys) — simplified lookup by month
// Source: WHO Child Growth Standards
const WHO_WAZ_BOYS = {
  0:{M:3.3,SD:0.46}, 3:{M:6.4,SD:0.74}, 6:{M:7.9,SD:0.86}, 9:{M:9.2,SD:0.94},
  12:{M:10.2,SD:1.02}, 18:{M:11.5,SD:1.12}, 24:{M:12.5,SD:1.2}, 36:{M:14.3,SD:1.38},
  48:{M:16.3,SD:1.6}, 60:{M:18.3,SD:1.85}, 72:{M:20.5,SD:2.2}, 84:{M:22.9,SD:2.6},
  96:{M:25.4,SD:3.1}, 108:{M:28.1,SD:3.7}, 120:{M:31.2,SD:4.4}
};
const WHO_WAZ_GIRLS = {
  0:{M:3.2,SD:0.44}, 3:{M:5.8,SD:0.66}, 6:{M:7.3,SD:0.78}, 9:{M:8.6,SD:0.86},
  12:{M:9.5,SD:0.94}, 18:{M:10.8,SD:1.04}, 24:{M:11.9,SD:1.12}, 36:{M:13.9,SD:1.3},
  48:{M:15.9,SD:1.54}, 60:{M:18.0,SD:1.8}, 72:{M:20.2,SD:2.1}, 84:{M:22.5,SD:2.55},
  96:{M:25.0,SD:3.1}, 108:{M:28.0,SD:3.8}, 120:{M:31.5,SD:4.6}
};
// WHO Height-for-Age
const WHO_HAZ_BOYS = {
  0:{M:49.9,SD:1.89}, 3:{M:62.0,SD:2.3}, 6:{M:67.6,SD:2.45}, 9:{M:72.3,SD:2.56},
  12:{M:75.7,SD:2.65}, 18:{M:82.3,SD:2.78}, 24:{M:87.8,SD:3.0}, 36:{M:96.1,SD:3.37},
  48:{M:103.3,SD:3.66}, 60:{M:110.0,SD:3.94}, 72:{M:116.0,SD:4.2}, 84:{M:121.7,SD:4.5},
  96:{M:127.3,SD:4.8}, 108:{M:132.6,SD:5.1}, 120:{M:137.5,SD:5.4}
};
const WHO_HAZ_GIRLS = {
  0:{M:49.1,SD:1.86}, 3:{M:60.2,SD:2.2}, 6:{M:65.7,SD:2.35}, 9:{M:70.1,SD:2.46},
  12:{M:74.0,SD:2.55}, 18:{M:80.7,SD:2.7}, 24:{M:86.4,SD:2.9}, 36:{M:95.1,SD:3.26},
  48:{M:102.7,SD:3.57}, 60:{M:109.4,SD:3.87}, 72:{M:115.5,SD:4.14}, 84:{M:121.1,SD:4.45},
  96:{M:126.6,SD:4.75}, 108:{M:132.2,SD:5.1}, 120:{M:137.2,SD:5.4}
};

function getWHORef(ageMonths, gender, type) {
  const table = type === "weight"
    ? (gender === "Female" ? WHO_WAZ_GIRLS : WHO_WAZ_BOYS)
    : (gender === "Female" ? WHO_HAZ_GIRLS : WHO_HAZ_BOYS);
  const keys = Object.keys(table).map(Number).sort((a,b)=>a-b);
  let closest = keys[0];
  for (const k of keys) { if (ageMonths >= k) closest = k; else break; }
  return table[closest];
}

function calcZ(value, ref) {
  if (!ref || !value) return null;
  return ((value - ref.M) / ref.SD).toFixed(2);
}

function zLabel(z) {
  if (z === null) return null;
  const n = parseFloat(z);
  if (n < -3) return { label: "Severe", color: "text-red-700 bg-red-100" };
  if (n < -2) return { label: "Moderate", color: "text-orange-700 bg-orange-100" };
  if (n < -1) return { label: "Mild", color: "text-amber-700 bg-amber-100" };
  if (n <= 1) return { label: "Normal", color: "text-green-700 bg-green-100" };
  return { label: "Overweight/Tall", color: "text-blue-700 bg-blue-100" };
}

const CENTILE_LINES = [
  { z: -3, label: "-3SD", color: "#ef4444", dash: "5 5" },
  { z: -2, label: "-2SD", color: "#f97316", dash: "5 5" },
  { z: 0,  label: "Median", color: "#10b981", dash: "0" },
  { z: 2,  label: "+2SD", color: "#3b82f6", dash: "5 5" },
];

export default function GrowthMonitoringEngine({ patientId, gender = "Male" }) {
  const [showForm, setShowForm] = useState(false);
  const [newRecord, setNewRecord] = useState({ weight_kg: "", height_cm: "", measurement_date: new Date().toISOString().split('T')[0], tanner_stage: "Not Assessed", notes: "" });
  const [aiAlert, setAiAlert] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [chartType, setChartType] = useState("weight");
  const [saving, setSaving] = useState(false);

  const { data: patient } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => base44.entities.Patient.filter({ id: patientId }).then(r => r[0]),
    enabled: !!patientId
  });

  const { data: records = [], refetch } = useQuery({
    queryKey: ['growth-records', patientId],
    queryFn: () => base44.entities.GrowthRecord.filter({ patient_id: patientId }, 'measurement_date'),
    enabled: !!patientId
  });

  const pt = patient || {};
  const ptGender = pt.gender || gender;
  const ptDOB = pt.date_of_birth;

  // Enrich records with Z-scores
  const enriched = records.map(r => {
    const ageMonths = ptDOB
      ? Math.round((new Date(r.measurement_date) - new Date(ptDOB)) / (1000 * 60 * 60 * 24 * 30.44))
      : (r.age_at_measurement_months || 0);
    const wRef = getWHORef(ageMonths, ptGender, "weight");
    const hRef = getWHORef(ageMonths, ptGender, "height");
    const waz = calcZ(r.weight_kg, wRef);
    const haz = calcZ(r.height_cm, hRef);
    return { ...r, ageMonths, waz: parseFloat(waz), haz: parseFloat(haz), wRef, hRef };
  });

  // Build chart data with centile reference lines
  const chartData = enriched.map(r => ({
    date: r.measurement_date,
    age: r.ageMonths,
    value: chartType === "weight" ? r.weight_kg : r.height_cm,
    zScore: chartType === "weight" ? r.waz : r.haz,
    p3: chartType === "weight" ? (r.wRef?.M + r.wRef?.SD * -2) : (r.hRef?.M + r.hRef?.SD * -2),
    p50: chartType === "weight" ? r.wRef?.M : r.hRef?.M,
    p97: chartType === "weight" ? (r.wRef?.M + r.wRef?.SD * 2) : (r.hRef?.M + r.hRef?.SD * 2),
  }));

  // Check for stunting/centile crossing
  const analyzeGrowth = async () => {
    if (enriched.length < 2) { toast.info("Need at least 2 measurements for trend analysis"); return; }
    setLoadingAI(true);
    try {
      const last3 = enriched.slice(-3);
      const wazTrend = last3.map(r => `Age ${r.ageMonths}mo: WAZ=${r.waz}, HAZ=${r.haz}, Wt=${r.weight_kg}kg, Ht=${r.height_cm}cm`).join("; ");
      const velocityDrops = [];
      for (let i = 1; i < last3.length; i++) {
        const prev = last3[i-1], curr = last3[i];
        const monthDiff = curr.ageMonths - prev.ageMonths;
        if (monthDiff > 0) {
          const hVel = (curr.height_cm - prev.height_cm) / (monthDiff / 12);
          velocityDrops.push(`Height velocity: ${hVel.toFixed(1)} cm/year`);
        }
      }
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a paediatric nephrologist reviewing growth data. Patient: ${pt.patient_name || 'Patient'}, Gender: ${ptGender}, Diagnosis: ${pt.diagnosis || 'Unknown'}.\n\nGrowth data (last 3 visits): ${wazTrend}\nCalculated: ${velocityDrops.join(", ")}\n\nAnalyse: 1) Is there stunting (HAZ<-2)? 2) Wasting (WAZ<-2)? 3) Significant centile crossing (>2 major centiles in any direction)? 4) Growth velocity concern (<4cm/yr age 2-4y, <5cm/yr age 4-10y, <6cm/yr puberty)? 5) Steroid-related growth impairment? Give a 3-5 line clinical summary with specific action recommendations. Use bullet points.`,
      });
      setAiAlert(result);
    } catch {
      toast.error("AI analysis failed");
    } finally {
      setLoadingAI(false);
    }
  };

  const saveRecord = async () => {
    if (!patientId) return;
    if (!newRecord.weight_kg || !newRecord.height_cm) { toast.error("Weight and height are required"); return; }
    setSaving(true);
    const ageMonths = ptDOB
      ? Math.round((new Date(newRecord.measurement_date) - new Date(ptDOB)) / (1000 * 60 * 60 * 24 * 30.44))
      : 0;
    const wRef = getWHORef(ageMonths, ptGender, "weight");
    const hRef = getWHORef(ageMonths, ptGender, "height");
    const waz = calcZ(parseFloat(newRecord.weight_kg), wRef);
    const haz = calcZ(parseFloat(newRecord.height_cm), hRef);
    const bmi = (parseFloat(newRecord.weight_kg) / Math.pow(parseFloat(newRecord.height_cm)/100, 2)).toFixed(1);
    await base44.entities.GrowthRecord.create({
      patient_id: patientId,
      ...newRecord,
      weight_kg: parseFloat(newRecord.weight_kg),
      height_cm: parseFloat(newRecord.height_cm),
      bmi: parseFloat(bmi),
      age_at_measurement_months: ageMonths,
      weight_for_age_z: parseFloat(waz),
      height_for_age_z: parseFloat(haz),
      stunting: parseFloat(haz) < -2,
      wasting: parseFloat(waz) < -2,
    });
    toast.success("Growth record saved");
    setShowForm(false);
    setNewRecord({ weight_kg: "", height_cm: "", measurement_date: new Date().toISOString().split('T')[0], tanner_stage: "Not Assessed", notes: "" });
    refetch();
    setSaving(false);
  };

  const latest = enriched[enriched.length - 1];
  const stunted = latest && latest.haz < -2;
  const wasted = latest && latest.waz < -2;

  return (
    <div className="space-y-4">
      {/* Alerts */}
      {(stunted || wasted) && (
        <Alert className="bg-red-50 border-2 border-red-400">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-900 text-sm font-semibold">
            ⚠️ Growth Warning: {stunted && "STUNTING (HAZ < -2SD)"} {stunted && wasted && " + "} {wasted && "WASTING (WAZ < -2SD)"}
            — Immediate nutritional/clinical review required.
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Baby className="w-5 h-5 text-teal-600" />
          <h3 className="font-bold text-slate-800">Growth Monitoring — WHO Standards</h3>
          <Badge className="bg-teal-100 text-teal-800">{records.length} measurements</Badge>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={analyzeGrowth} disabled={loadingAI || records.length < 2}>
            {loadingAI ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Brain className="w-3 h-3 mr-1" />}
            AI Growth Analysis
          </Button>
          <Button size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={() => setShowForm(!showForm)}>
            <Plus className="w-3 h-3 mr-1" />Add Measurement
          </Button>
        </div>
      </div>

      {/* Add Measurement Form */}
      {showForm && (
        <Card className="bg-teal-50 border-teal-200">
          <CardContent className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600">Date</label>
              <Input type="date" value={newRecord.measurement_date} onChange={e => setNewRecord(p => ({...p, measurement_date: e.target.value}))} className="mt-1 text-xs" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Weight (kg)</label>
              <Input type="number" step="0.1" placeholder="e.g. 15.5" value={newRecord.weight_kg} onChange={e => setNewRecord(p => ({...p, weight_kg: e.target.value}))} className="mt-1 text-xs" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Height (cm)</label>
              <Input type="number" step="0.1" placeholder="e.g. 95.0" value={newRecord.height_cm} onChange={e => setNewRecord(p => ({...p, height_cm: e.target.value}))} className="mt-1 text-xs" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Tanner Stage</label>
              <Select value={newRecord.tanner_stage} onValueChange={v => setNewRecord(p => ({...p, tanner_stage: v}))}>
                <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Not Assessed","I","II","III","IV","V"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 md:col-span-3">
              <label className="text-xs font-semibold text-slate-600">Notes</label>
              <Input placeholder="e.g. steroid dose, intercurrent illness" value={newRecord.notes} onChange={e => setNewRecord(p => ({...p, notes: e.target.value}))} className="mt-1 text-xs" />
            </div>
            <div className="flex items-end gap-2">
              <Button size="sm" className="bg-teal-600 w-full" onClick={saveRecord} disabled={saving}>
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chart Toggle */}
      <div className="flex gap-2">
        <Button size="sm" variant={chartType === "weight" ? "default" : "outline"} onClick={() => setChartType("weight")} className={chartType === "weight" ? "bg-teal-600" : ""}>
          Weight-for-Age
        </Button>
        <Button size="sm" variant={chartType === "height" ? "default" : "outline"} onClick={() => setChartType("height")} className={chartType === "height" ? "bg-teal-600" : ""}>
          Height-for-Age
        </Button>
      </div>

      {/* Growth Chart */}
      {chartData.length > 0 ? (
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2 border-b bg-teal-50">
            <CardTitle className="text-sm font-bold text-teal-900">
              {chartType === "weight" ? "Weight-for-Age" : "Height-for-Age"} — WHO {ptGender} Reference
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0]?.payload;
                    return (
                      <div className="bg-white border rounded shadow p-2 text-xs">
                        <p className="font-bold">{d.date}</p>
                        <p>Age: {d.age}mo | Value: {d.value} {chartType === "weight" ? "kg" : "cm"}</p>
                        <p className={d.zScore < -2 ? "text-red-600 font-bold" : "text-green-600"}>Z-score: {d.zScore?.toFixed(2)}</p>
                        <p className="text-slate-500">3rd centile: {d.p3?.toFixed(1)} | Median: {d.p50?.toFixed(1)} | 97th: {d.p97?.toFixed(1)}</p>
                      </div>
                    );
                  }}
                />
                <Legend />
                <Line dataKey="p3" name="-2SD (3rd centile)" stroke="#ef4444" strokeDasharray="5 5" strokeWidth={1} dot={false} />
                <Line dataKey="p50" name="Median (50th)" stroke="#10b981" strokeDasharray="3 3" strokeWidth={1} dot={false} />
                <Line dataKey="p97" name="+2SD (97th)" stroke="#3b82f6" strokeDasharray="5 5" strokeWidth={1} dot={false} />
                <Line dataKey="value" name={chartType === "weight" ? "Patient Weight" : "Patient Height"} stroke="#7c3aed" strokeWidth={2.5} dot={{ r: 5, fill: "#7c3aed" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-slate-50 border-dashed border-2">
          <CardContent className="p-8 text-center text-slate-400">
            <Baby className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No growth records yet — add the first measurement above</p>
          </CardContent>
        </Card>
      )}

      {/* Z-Score Summary Table */}
      {enriched.length > 0 && (
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2 border-b"><CardTitle className="text-xs font-bold text-slate-700 uppercase">Z-Score History</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    {["Date","Age(mo)","Wt(kg)","Ht(cm)","BMI","WAZ","HAZ","Status"].map(h => (
                      <th key={h} className="px-3 py-2 text-left font-semibold text-slate-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {enriched.map((r, i) => {
                    const wLabel = zLabel(r.waz); const hLabel = zLabel(r.haz);
                    const bmi = r.weight_kg && r.height_cm ? (r.weight_kg / Math.pow(r.height_cm/100, 2)).toFixed(1) : "-";
                    return (
                      <tr key={i} className={`border-b ${r.haz < -2 || r.waz < -2 ? "bg-red-50" : ""}`}>
                        <td className="px-3 py-2">{r.measurement_date}</td>
                        <td className="px-3 py-2">{r.ageMonths}</td>
                        <td className="px-3 py-2">{r.weight_kg}</td>
                        <td className="px-3 py-2">{r.height_cm}</td>
                        <td className="px-3 py-2">{bmi}</td>
                        <td className="px-3 py-2"><span className={`px-1.5 py-0.5 rounded text-xs font-medium ${wLabel?.color}`}>{r.waz?.toFixed(2)}</span></td>
                        <td className="px-3 py-2"><span className={`px-1.5 py-0.5 rounded text-xs font-medium ${hLabel?.color}`}>{r.haz?.toFixed(2)}</span></td>
                        <td className="px-3 py-2">
                          {r.haz < -3 ? <Badge className="bg-red-600 text-white text-xs">Severe Stunting</Badge>
                          : r.haz < -2 ? <Badge className="bg-orange-500 text-white text-xs">Stunting</Badge>
                          : r.waz < -2 ? <Badge className="bg-amber-500 text-white text-xs">Wasting</Badge>
                          : <Badge className="bg-green-100 text-green-800 text-xs">Normal</Badge>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Alert */}
      {aiAlert && (
        <Card className="bg-violet-50 border-2 border-violet-300">
          <CardHeader className="pb-2 border-b border-violet-200">
            <CardTitle className="text-sm font-bold text-violet-900 flex items-center gap-2">
              <Brain className="w-4 h-4" />AI Growth Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 text-sm text-slate-800 whitespace-pre-line">{aiAlert}</CardContent>
        </Card>
      )}
    </div>
  );
}