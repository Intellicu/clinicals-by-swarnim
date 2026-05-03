import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Baby, Plus, Trash2, TrendingUp, CheckCircle2, Activity } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine
} from "recharts";
import { toast } from "sonner";

const STORAGE_KEY = "peds_growth_standalone";

// WHO Z-score reference data (Median + SD, by age in months)
const WHO_DATA = {
  weight: {
    Male: {
      0:{M:3.35,SD:0.46}, 1:{M:4.47,SD:0.55}, 2:{M:5.57,SD:0.63}, 3:{M:6.39,SD:0.70},
      4:{M:7.00,SD:0.75}, 5:{M:7.51,SD:0.79}, 6:{M:7.93,SD:0.83}, 9:{M:9.18,SD:0.94},
      12:{M:10.19,SD:1.02}, 15:{M:11.04,SD:1.09}, 18:{M:11.65,SD:1.14}, 24:{M:12.54,SD:1.22},
      30:{M:13.50,SD:1.33}, 36:{M:14.33,SD:1.39}, 42:{M:15.20,SD:1.48}, 48:{M:16.27,SD:1.60},
      54:{M:17.16,SD:1.72}, 60:{M:18.34,SD:1.87}, 72:{M:20.51,SD:2.20}, 84:{M:22.92,SD:2.62},
      96:{M:25.44,SD:3.10}, 108:{M:28.13,SD:3.72}, 120:{M:31.16,SD:4.44}
    },
    Female: {
      0:{M:3.23,SD:0.44}, 1:{M:4.20,SD:0.52}, 2:{M:5.12,SD:0.59}, 3:{M:5.83,SD:0.65},
      4:{M:6.41,SD:0.70}, 5:{M:6.87,SD:0.74}, 6:{M:7.28,SD:0.78}, 9:{M:8.56,SD:0.87},
      12:{M:9.53,SD:0.95}, 15:{M:10.25,SD:1.01}, 18:{M:10.82,SD:1.06}, 24:{M:11.92,SD:1.16},
      30:{M:12.96,SD:1.27}, 36:{M:13.91,SD:1.36}, 42:{M:14.85,SD:1.47}, 48:{M:15.95,SD:1.59},
      54:{M:16.90,SD:1.72}, 60:{M:18.03,SD:1.87}, 72:{M:20.23,SD:2.16}, 84:{M:22.51,SD:2.55},
      96:{M:25.03,SD:3.05}, 108:{M:28.02,SD:3.80}, 120:{M:31.51,SD:4.64}
    }
  },
  height: {
    Male: {
      0:{M:49.88,SD:1.89}, 1:{M:54.72,SD:2.04}, 2:{M:58.42,SD:2.16}, 3:{M:61.43,SD:2.26},
      4:{M:63.88,SD:2.33}, 5:{M:65.90,SD:2.38}, 6:{M:67.62,SD:2.44}, 9:{M:72.27,SD:2.56},
      12:{M:75.75,SD:2.65}, 15:{M:79.12,SD:2.73}, 18:{M:82.34,SD:2.80}, 24:{M:87.83,SD:2.99},
      30:{M:92.72,SD:3.17}, 36:{M:96.10,SD:3.37}, 42:{M:99.89,SD:3.52}, 48:{M:103.31,SD:3.67},
      54:{M:106.39,SD:3.81}, 60:{M:110.00,SD:3.95}, 72:{M:116.04,SD:4.20}, 84:{M:121.73,SD:4.50},
      96:{M:127.34,SD:4.80}, 108:{M:132.60,SD:5.10}, 120:{M:137.53,SD:5.40}
    },
    Female: {
      0:{M:49.15,SD:1.86}, 1:{M:53.69,SD:2.00}, 2:{M:57.07,SD:2.13}, 3:{M:59.80,SD:2.22},
      4:{M:62.09,SD:2.29}, 5:{M:64.03,SD:2.35}, 6:{M:65.73,SD:2.40}, 9:{M:70.14,SD:2.47},
      12:{M:74.01,SD:2.55}, 15:{M:77.48,SD:2.65}, 18:{M:80.74,SD:2.73}, 24:{M:86.39,SD:2.93},
      30:{M:91.23,SD:3.11}, 36:{M:95.12,SD:3.27}, 42:{M:98.94,SD:3.43}, 48:{M:102.74,SD:3.58},
      54:{M:105.95,SD:3.73}, 60:{M:109.42,SD:3.87}, 72:{M:115.55,SD:4.15}, 84:{M:121.09,SD:4.44},
      96:{M:126.61,SD:4.75}, 108:{M:132.17,SD:5.08}, 120:{M:137.19,SD:5.42}
    }
  },
  hc: { // Head circumference
    Male: {
      0:{M:34.5,SD:1.25}, 1:{M:37.3,SD:1.22}, 2:{M:39.1,SD:1.20}, 3:{M:40.5,SD:1.18},
      4:{M:41.6,SD:1.17}, 5:{M:42.6,SD:1.16}, 6:{M:43.3,SD:1.14}, 9:{M:45.0,SD:1.13},
      12:{M:46.3,SD:1.13}, 18:{M:47.6,SD:1.14}, 24:{M:48.3,SD:1.15}, 36:{M:49.2,SD:1.19}
    },
    Female: {
      0:{M:33.9,SD:1.20}, 1:{M:36.5,SD:1.17}, 2:{M:38.3,SD:1.15}, 3:{M:39.5,SD:1.14},
      4:{M:40.6,SD:1.13}, 5:{M:41.5,SD:1.12}, 6:{M:42.2,SD:1.11}, 9:{M:43.8,SD:1.11},
      12:{M:45.1,SD:1.11}, 18:{M:46.4,SD:1.12}, 24:{M:47.2,SD:1.14}, 36:{M:48.0,SD:1.17}
    }
  }
};

function getRef(ageM, gender, type) {
  const table = WHO_DATA[type]?.[gender] || {};
  const keys = Object.keys(table).map(Number).sort((a, b) => a - b);
  let best = keys[0];
  for (const k of keys) { if (ageM >= k) best = k; else break; }
  return table[best];
}

function calcZ(value, ref) {
  if (!ref || !value) return null;
  return parseFloat(((value - ref.M) / ref.SD).toFixed(2));
}

function centileFromZ(z) {
  // Approximate centile from Z
  if (z === null) return null;
  if (z <= -3) return "< 1st";
  if (z <= -2) return "3rd–15th";
  if (z <= -1) return "15th–16th";
  if (z <= 0) return "50th";
  if (z <= 1) return "84th";
  if (z <= 2) return "85th–97th";
  return "> 97th";
}

function statusFromZ(z, type) {
  if (z === null) return null;
  const labels = {
    weight: { severe: "Severe Wasting", moderate: "Wasting", mild: "Underweight", normal: "Normal Weight", high: "Overweight" },
    height: { severe: "Severe Stunting", moderate: "Stunting", mild: "Mild Stunting", normal: "Normal Height", high: "Tall" },
    hc: { severe: "Microcephaly", moderate: "Small HC", mild: "Low-Normal HC", normal: "Normal HC", high: "Macrocephaly" },
    bmi: { severe: "Severe Wasting", moderate: "Wasting", mild: "Underweight", normal: "Normal BMI", high: "Overweight" },
  };
  const l = labels[type] || labels.weight;
  if (z < -3) return { label: l.severe, color: "bg-red-600 text-white" };
  if (z < -2) return { label: l.moderate, color: "bg-orange-500 text-white" };
  if (z < -1) return { label: l.mild, color: "bg-amber-400 text-slate-900" };
  if (z <= 1) return { label: l.normal, color: "bg-green-500 text-white" };
  if (z <= 2) return { label: l.high, color: "bg-blue-400 text-white" };
  return { label: "Severe " + l.high, color: "bg-purple-600 text-white" };
}

// Build WHO centile curve data for chart
function buildCentileCurve(gender, metric, maxAge = 120) {
  const table = WHO_DATA[metric]?.[gender] || {};
  return Object.entries(table)
    .filter(([age]) => Number(age) <= maxAge)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([age, ref]) => ({
      age: Number(age),
      p3: parseFloat((ref.M - 2 * ref.SD).toFixed(2)),
      p15: parseFloat((ref.M - 1 * ref.SD).toFixed(2)),
      p50: parseFloat(ref.M.toFixed(2)),
      p85: parseFloat((ref.M + 1 * ref.SD).toFixed(2)),
      p97: parseFloat((ref.M + 2 * ref.SD).toFixed(2)),
    }));
}

export default function InteractiveGrowthChart() {
  const [gender, setGender] = useState("Male");
  const [chartMetric, setChartMetric] = useState("weight");
  const [records, setRecords] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
  });
  const [form, setForm] = useState({ ageMonths: "", weight: "", height: "", hc: "", date: new Date().toISOString().split("T")[0] });

  const save = (updated) => { setRecords(updated); localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); };

  const addRecord = () => {
    if (!form.ageMonths) { toast.error("Age in months is required"); return; }
    if (!form.weight && !form.height) { toast.error("At least weight or height required"); return; }
    const ageM = parseFloat(form.ageMonths);
    const w = parseFloat(form.weight) || null;
    const h = parseFloat(form.height) || null;
    const hc = parseFloat(form.hc) || null;
    const bmi = w && h ? parseFloat((w / Math.pow(h / 100, 2)).toFixed(1)) : null;

    const wRef = getRef(ageM, gender, "weight");
    const hRef = getRef(ageM, gender, "height");
    const hcRef = getRef(ageM, gender, "hc");

    const waz = calcZ(w, wRef);
    const haz = calcZ(h, hRef);
    const hcz = calcZ(hc, hcRef);
    // BMI-for-age using weight Z as proxy (simplified)
    const bmiz = waz !== null && haz !== null ? parseFloat(((waz - haz * 0.5) * 1.2).toFixed(2)) : null;

    const rec = { date: form.date, ageMonths: ageM, weight: w, height: h, hc, bmi, waz, haz, hcz, bmiz };
    const updated = [...records, rec].sort((a, b) => a.ageMonths - b.ageMonths);
    save(updated);
    setForm(f => ({ ...f, weight: "", height: "", hc: "", ageMonths: "" }));
    toast.success("Growth record added");
  };

  const removeRecord = (i) => save(records.filter((_, idx) => idx !== i));

  // Build centile reference curves
  const maxAge = Math.max(60, ...(records.map(r => r.ageMonths)));
  const centileCurve = buildCentileCurve(gender, chartMetric, maxAge + 6);

  // Merge patient points onto centile curve data
  const metricKey = chartMetric === "weight" ? "weight" : chartMetric === "height" ? "height" : "hc";
  const chartData = centileCurve.map(cp => {
    const patRec = records.find(r => Math.abs(r.ageMonths - cp.age) < 1);
    return { ...cp, patient: patRec ? patRec[metricKey] : undefined };
  });
  // Also add patient points at exact ages not in curve
  const extraPoints = records
    .filter(r => !centileCurve.some(cp => Math.abs(cp.age - r.ageMonths) < 1))
    .map(r => ({ age: r.ageMonths, patient: r[metricKey] }));
  const mergedData = [...chartData, ...extraPoints].sort((a, b) => a.age - b.age);

  const latest = records[records.length - 1];

  return (
    <div className="space-y-4">
      {/* Gender + Metric switcher */}
      <div className="flex gap-2 flex-wrap">
        {["Male", "Female"].map(g => (
          <Button key={g} size="sm" onClick={() => setGender(g)}
            className={`h-8 text-xs ${gender === g ? "bg-slate-800 text-white" : "bg-white border border-slate-300 text-slate-600 hover:bg-slate-50"}`}>
            {g === "Male" ? "♂ Male" : "♀ Female"}
          </Button>
        ))}
        <div className="ml-auto flex gap-1">
          {[{ k: "weight", l: "Weight" }, { k: "height", l: "Height" }, { k: "hc", l: "Head Circ" }].map(m => (
            <Button key={m.k} size="sm" onClick={() => setChartMetric(m.k)}
              className={`h-8 text-xs ${chartMetric === m.k ? "bg-purple-700 text-white" : "bg-white border border-purple-200 text-purple-700 hover:bg-purple-50"}`}>
              {m.l}
            </Button>
          ))}
        </div>
      </div>

      {/* Add measurement */}
      <Card className="bg-white border-2 border-purple-200">
        <CardHeader className="bg-purple-50 border-b py-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Plus className="w-4 h-4 text-purple-600" />Add Growth Measurement
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-600">Date</label>
              <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="mt-1 h-8 text-xs" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Age (months)</label>
              <Input type="number" placeholder="e.g. 24" value={form.ageMonths} onChange={e => setForm(f => ({ ...f, ageMonths: e.target.value }))} className="mt-1 h-8 text-xs" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Weight (kg)</label>
              <Input type="number" step="0.1" placeholder="e.g. 12.5" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} className="mt-1 h-8 text-xs" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Height (cm)</label>
              <Input type="number" step="0.1" placeholder="e.g. 87" value={form.height} onChange={e => setForm(f => ({ ...f, height: e.target.value }))} className="mt-1 h-8 text-xs" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Head Circ (cm)</label>
              <Input type="number" step="0.1" placeholder="HC cm" value={form.hc} onChange={e => setForm(f => ({ ...f, hc: e.target.value }))} className="mt-1 h-8 text-xs" />
            </div>
          </div>
          <Button onClick={addRecord} className="mt-3 bg-purple-700 hover:bg-purple-800 h-8 text-sm w-full md:w-auto">
            <Plus className="w-4 h-4 mr-1" />Add Measurement
          </Button>
        </CardContent>
      </Card>

      {/* WHO Growth Chart */}
      <Card className="bg-white border-2 border-purple-100 shadow-sm">
        <CardHeader className="bg-purple-50 border-b py-3">
          <CardTitle className="text-sm font-bold text-purple-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            WHO {gender} Growth Chart — {chartMetric === "weight" ? "Weight-for-Age" : chartMetric === "height" ? "Height-for-Age" : "Head Circumference-for-Age"}
          </CardTitle>
          <div className="flex gap-2 mt-1 flex-wrap text-xs">
            <span className="flex items-center gap-1"><span className="w-6 h-0.5 bg-red-400 inline-block border-t-2 border-dashed border-red-400" /> 3rd</span>
            <span className="flex items-center gap-1"><span className="w-6 h-0.5 bg-orange-400 inline-block border-t-2 border-dashed border-orange-400" /> 15th</span>
            <span className="flex items-center gap-1"><span className="w-6 h-0.5 bg-green-500 inline-block" /> 50th (Median)</span>
            <span className="flex items-center gap-1"><span className="w-6 h-0.5 bg-blue-400 inline-block border-t-2 border-dashed border-blue-400" /> 85th</span>
            <span className="flex items-center gap-1"><span className="w-6 h-0.5 bg-purple-400 inline-block border-t-2 border-dashed border-purple-400" /> 97th</span>
            <span className="flex items-center gap-1"><span className="w-4 h-4 rounded-full bg-slate-800 inline-block" /> Patient</span>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={mergedData} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="age" label={{ value: "Age (months)", position: "insideBottom", offset: -2, fontSize: 10 }} tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 9 }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="bg-white border rounded-lg shadow p-2 text-xs">
                      <p className="font-bold text-slate-700">Age: {label} months</p>
                      {payload.map((p, i) => p.value != null && (
                        <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
                      ))}
                    </div>
                  );
                }}
              />
              <Line type="monotone" dataKey="p3" name="3rd centile" stroke="#ef4444" strokeWidth={1} strokeDasharray="5 5" dot={false} />
              <Line type="monotone" dataKey="p15" name="15th centile" stroke="#f97316" strokeWidth={1} strokeDasharray="5 5" dot={false} />
              <Line type="monotone" dataKey="p50" name="50th (Median)" stroke="#10b981" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="p85" name="85th centile" stroke="#3b82f6" strokeWidth={1} strokeDasharray="5 5" dot={false} />
              <Line type="monotone" dataKey="p97" name="97th centile" stroke="#8b5cf6" strokeWidth={1} strokeDasharray="5 5" dot={false} />
              <Line type="monotone" dataKey="patient" name="Patient" stroke="#1e293b" strokeWidth={2.5} dot={{ r: 5, fill: "#1e293b", strokeWidth: 2, stroke: "#fff" }} connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Z-score summary */}
      {records.length > 0 && (
        <Card className="bg-white border-2 border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b py-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-600" />Growth Records & Z-scores
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-100 border-b">
                  <tr>
                    {["Date", "Age(mo)", "Wt(kg)", "Ht(cm)", "HC(cm)", "BMI", "WAZ", "HAZ", "Status"].map(h => (
                      <th key={h} className="px-2 py-2 text-left font-semibold text-slate-600 whitespace-nowrap">{h}</th>
                    ))}
                    <th className="px-2 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, i) => {
                    const ws = statusFromZ(r.waz, "weight");
                    const hs = statusFromZ(r.haz, "height");
                    const isAlert = (r.waz !== null && r.waz < -2) || (r.haz !== null && r.haz < -2);
                    return (
                      <tr key={i} className={`border-b ${isAlert ? "bg-red-50" : i % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                        <td className="px-2 py-2 whitespace-nowrap">{r.date}</td>
                        <td className="px-2 py-2">{r.ageMonths}</td>
                        <td className="px-2 py-2">{r.weight ?? "—"}</td>
                        <td className="px-2 py-2">{r.height ?? "—"}</td>
                        <td className="px-2 py-2">{r.hc ?? "—"}</td>
                        <td className="px-2 py-2">{r.bmi ?? "—"}</td>
                        <td className="px-2 py-2 font-bold">{r.waz?.toFixed(2) ?? "—"}</td>
                        <td className="px-2 py-2 font-bold">{r.haz?.toFixed(2) ?? "—"}</td>
                        <td className="px-2 py-2">
                          {r.haz !== null && r.haz < -2 ? (
                            <Badge className={`text-[10px] ${statusFromZ(r.haz, "height")?.color}`}>{statusFromZ(r.haz, "height")?.label}</Badge>
                          ) : r.waz !== null && r.waz < -2 ? (
                            <Badge className={`text-[10px] ${statusFromZ(r.waz, "weight")?.color}`}>{statusFromZ(r.waz, "weight")?.label}</Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800 text-[10px]">Normal</Badge>
                          )}
                        </td>
                        <td className="px-2 py-2">
                          <button onClick={() => removeRecord(i)} className="text-red-400 hover:text-red-600">
                            <Trash2 className="w-3 h-3" />
                          </button>
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

      {/* Latest Z-score cards */}
      {latest && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Weight-for-Age", z: latest.waz, type: "weight" },
            { label: "Height-for-Age", z: latest.haz, type: "height" },
            { label: "BMI-for-Age", z: latest.bmiz, type: "bmi" },
            { label: "Head Circ", z: latest.hcz, type: "hc" },
          ].map(({ label, z, type }) => {
            const s = statusFromZ(z, type);
            return (
              <div key={type} className={`rounded-xl p-3 text-center ${z !== null ? s?.color : "bg-slate-100 text-slate-400"}`}>
                <p className="text-[10px] font-semibold opacity-80 mb-1">{label}</p>
                <p className="text-2xl font-black">{z !== null ? z.toFixed(2) : "—"}</p>
                <p className="text-[10px] font-bold mt-0.5">{s?.label || "No data"}</p>
                <p className="text-[9px] opacity-70">{z !== null ? `~${centileFromZ(z)} centile` : ""}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Growth alerts */}
      {latest && ((latest.haz !== null && latest.haz < -2) || (latest.waz !== null && latest.waz < -2)) && (
        <Alert className="bg-red-50 border-2 border-red-400">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-900 text-sm font-semibold">
            ⚠️ Growth Concern — Latest visit:
            {latest.haz !== null && latest.haz < -3 && " SEVERE STUNTING (HAZ < -3SD)"}
            {latest.haz !== null && latest.haz >= -3 && latest.haz < -2 && " STUNTING (HAZ < -2SD)"}
            {latest.waz !== null && latest.waz < -2 && " WASTING (WAZ < -2SD)"}
            {" "}— Review nutrition, underlying cause, and growth velocity.
          </AlertDescription>
        </Alert>
      )}

      {records.length === 0 && (
        <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
          <Baby className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No measurements added yet</p>
          <p className="text-xs mt-1">Add the first measurement above to see WHO centile chart</p>
        </div>
      )}
    </div>
  );
}