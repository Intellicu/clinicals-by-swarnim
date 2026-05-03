import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Plus, Trash2, TrendingUp, TrendingDown, Activity, CheckCircle2 } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from "recharts";

const STORAGE_KEY = "peds_lab_trends";

const LABS = {
  creatinine: { label: "Creatinine (mg/dL)", unit: "mg/dL", color: "#ef4444", normalMax: 0.9, criticalRise: 1.5, refLow: 0.3, refHigh: 0.9 },
  upcr: { label: "UPCR (mg/mg)", unit: "mg/mg", color: "#8b5cf6", normalMax: 0.2, criticalRise: 2.0, refLow: 0, refHigh: 0.2 },
  albumin: { label: "Albumin (g/dL)", unit: "g/dL", color: "#3b82f6", normalMin: 3.5, criticalLow: 2.5, refLow: 3.5, refHigh: 5.0 },
  sodium: { label: "Sodium (mEq/L)", unit: "mEq/L", color: "#06b6d4", refLow: 135, refHigh: 145 },
  potassium: { label: "Potassium (mEq/L)", unit: "mEq/L", color: "#f97316", refLow: 3.5, refHigh: 5.5 },
  bicarbonate: { label: "Bicarbonate (mEq/L)", unit: "mEq/L", color: "#10b981", refLow: 22, refHigh: 28 },
  c3: { label: "C3 Complement (mg/dL)", unit: "mg/dL", color: "#a78bfa", refLow: 90, refHigh: 180 },
  phosphorus: { label: "Phosphorus (mg/dL)", unit: "mg/dL", color: "#fb7185", refLow: 3.0, refHigh: 7.0 },
};

function analyzePattern(values, key) {
  const lab = LABS[key];
  const alerts = [];
  const n = values.length;
  if (n < 2) return alerts;

  const last = values[n - 1]?.value;
  const prev = values[n - 2]?.value;
  const pct = prev ? Math.round(((last - prev) / prev) * 100) : 0;

  // Rising creatinine → AKI
  if (key === "creatinine") {
    if (last > prev * 1.5) alerts.push({ type: "error", msg: `🔴 AKI ALERT: Creatinine rose ${pct}% (${prev}→${last} mg/dL) — KDIGO AKI Stage ≥1. Urgent evaluation.` });
    else if (last > prev * 1.25) alerts.push({ type: "warn", msg: `🟠 Creatinine rising (${pct}%) — monitor closely for AKI.` });
    if (last >= 5) alerts.push({ type: "error", msg: `🔴 CRITICAL: Cr ≥5 mg/dL — consider dialysis initiation.` });
  }

  // Albumin drop → NS relapse / malnutrition
  if (key === "albumin") {
    if (last < 2.0) alerts.push({ type: "error", msg: `🔴 Severe hypoalbuminemia (${last} g/dL) — VTE, infection risk HIGH. Consider IV albumin.` });
    else if (last < 2.5) alerts.push({ type: "warn", msg: `🟠 Albumin ${last} g/dL — moderate hypoalbuminemia. Review edema, nutrition.` });
    if (last < prev * 0.8) alerts.push({ type: "warn", msg: `⚠️ Albumin dropping rapidly (${pct}%) — possible NS relapse?` });
  }

  // High UPCR
  if (key === "upcr") {
    if (last >= 2.0) alerts.push({ type: "error", msg: `🔴 Nephrotic range proteinuria (UPCR ${last}) — active NS or relapse.` });
    else if (last >= 0.5) alerts.push({ type: "warn", msg: `🟠 Significant proteinuria UPCR ${last} — monitor kidney function.` });
    if (last > prev * 2) alerts.push({ type: "warn", msg: `⚠️ UPCR doubled — possible NS relapse. Check urine dipstick.` });
  }

  // Hypokalemia → tubulopathy
  if (key === "potassium") {
    if (last < 2.5) alerts.push({ type: "error", msg: `🔴 Severe hypokalemia K+ ${last} mEq/L — arrhythmia risk. IV replacement needed.` });
    else if (last < 3.0) alerts.push({ type: "warn", msg: `🟠 Hypokalemia K+ ${last} mEq/L. If persistent → RTA Type 1 or Bartter/Gitelman?` });
    const isLowAll = values.slice(-3).every(v => v.value < 3.5);
    if (isLowAll && n >= 3) alerts.push({ type: "warn", msg: `⚠️ Persistent hypokalemia (×3 readings <3.5) — suspect renal tubulopathy (Gitelman/Bartter/RTA1).` });
  }

  // Hyponatremia
  if (key === "sodium") {
    if (last < 120) alerts.push({ type: "error", msg: `🔴 CRITICAL hyponatremia Na+ ${last} mEq/L — seizure risk. Urgent 3% saline if symptomatic.` });
    else if (last < 130) alerts.push({ type: "error", msg: `🔴 Severe hyponatremia Na+ ${last} mEq/L — restrict free water, consider diagnosis.` });
  }

  // Metabolic acidosis
  if (key === "bicarbonate") {
    if (last < 14) alerts.push({ type: "error", msg: `🔴 Severe metabolic acidosis HCO3 ${last} — pH likely <7.2. Sodium bicarbonate urgently.` });
    else if (last < 18) alerts.push({ type: "warn", msg: `🟠 Metabolic acidosis HCO3 ${last} — evaluate RTA, diarrhea losses, CKD.` });
  }

  // C3 complement — PSGN tracking
  if (key === "c3") {
    if (last < 75) alerts.push({ type: "warn", msg: `🔵 Low C3 (${last} mg/dL) — active complement consumption. Track every 4 weeks.` });
    if (n >= 2 && last < lab.refLow && prev < lab.refLow) {
      const weeks = 8;
      alerts.push({ type: "warn", msg: `⚠️ C3 persistently low for ≥2 readings — If >8 weeks, biopsy to exclude C3GN/MPGN/Lupus (not PSGN).` });
    }
  }

  // Hyperphosphatemia
  if (key === "phosphorus") {
    if (last > 7) alerts.push({ type: "warn", msg: `🟠 Hyperphosphatemia (${last} mg/dL) in CKD — dietary restriction + phosphate binders.` });
  }

  return alerts;
}

export default function LabTrendIntelligence() {
  const [activeLab, setActiveLab] = useState("creatinine");
  const [allData, setAllData] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
  });
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);
  const [newValue, setNewValue] = useState("");

  const save = (updated) => { setAllData(updated); localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); };

  const addPoint = () => {
    if (!newValue || isNaN(parseFloat(newValue))) return;
    const labData = allData[activeLab] || [];
    const updated = { ...allData, [activeLab]: [...labData, { date: newDate, value: parseFloat(newValue) }].sort((a, b) => a.date.localeCompare(b.date)) };
    save(updated);
    setNewValue("");
  };

  const remove = (i) => {
    const updated = { ...allData, [activeLab]: (allData[activeLab] || []).filter((_, idx) => idx !== i) };
    save(updated);
  };

  const labConfig = LABS[activeLab];
  const labValues = allData[activeLab] || [];
  const alerts = analyzePattern(labValues, activeLab);

  // All alerts across all labs
  const allAlerts = Object.keys(LABS).flatMap(k => analyzePattern(allData[k] || [], k));

  return (
    <div className="space-y-4">
      <Alert className="bg-blue-50 border-blue-200">
        <TrendingUp className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-xs text-blue-900">
          <strong>Lab Trend Intelligence</strong> — Plot serial values, auto-detect AKI, NS relapse, tubulopathy, acidosis, and electrolyte emergencies. All data stored locally.
        </AlertDescription>
      </Alert>

      {/* All active alerts */}
      {allAlerts.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Active Pattern Alerts</p>
          {allAlerts.map((a, i) => (
            <Alert key={i} className={a.type === "error" ? "bg-red-50 border-red-300 py-2" : "bg-amber-50 border-amber-300 py-2"}>
              <AlertTriangle className={`w-4 h-4 ${a.type === "error" ? "text-red-600" : "text-amber-600"}`} />
              <AlertDescription className={`text-xs font-semibold ml-1 ${a.type === "error" ? "text-red-900" : "text-amber-900"}`}>{a.msg}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Lab selector */}
      <div className="flex gap-1.5 flex-wrap">
        {Object.entries(LABS).map(([k, v]) => (
          <Button key={k} size="sm" onClick={() => setActiveLab(k)}
            className={`text-xs h-8 ${activeLab === k ? "text-white shadow" : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"}`}
            style={activeLab === k ? { backgroundColor: v.color } : {}}>
            {v.label.split(" ")[0]}
            {(allData[k] || []).length > 0 && <Badge className="ml-1 bg-white/20 text-white text-[9px] px-1">{(allData[k] || []).length}</Badge>}
          </Button>
        ))}
      </div>

      {/* Add new value */}
      <Card className="bg-white border-2 border-slate-200">
        <CardHeader className="border-b py-2 px-4">
          <CardTitle className="text-sm font-bold" style={{ color: labConfig.color }}>{labConfig.label} — Add Reading</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="flex gap-2 items-end">
            <div>
              <label className="text-xs font-semibold text-slate-600">Date</label>
              <Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="mt-1 h-8 text-xs w-36" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Value ({labConfig.unit})</label>
              <Input type="number" step="0.01" value={newValue} onChange={e => setNewValue(e.target.value)} onKeyDown={e => e.key === "Enter" && addPoint()} className="mt-1 h-8 text-xs w-28" placeholder={`e.g. ${labConfig.refLow}`} />
            </div>
            <Button onClick={addPoint} className="h-8 px-3 text-xs" style={{ backgroundColor: labConfig.color }}>
              <Plus className="w-3 h-3 mr-1" />Add
            </Button>
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
            <span>Normal range:</span>
            <Badge className="bg-green-100 text-green-800 text-xs">{labConfig.refLow}–{labConfig.refHigh} {labConfig.unit}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      {labValues.length > 0 ? (
        <>
          <Card className="bg-white border-2 border-slate-200 shadow-sm">
            <CardHeader className="border-b py-2 px-4">
              <CardTitle className="text-sm font-bold">{labConfig.label} — Trend</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={labValues}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} domain={["auto", "auto"]} />
                  <Tooltip formatter={(v) => [`${v} ${labConfig.unit}`, labConfig.label]} />
                  <ReferenceLine y={labConfig.refHigh} stroke="#10b981" strokeDasharray="5 5" label={{ value: "Upper normal", position: "right", fontSize: 9, fill: "#10b981" }} />
                  <ReferenceLine y={labConfig.refLow} stroke="#10b981" strokeDasharray="5 5" label={{ value: "Lower normal", position: "right", fontSize: 9, fill: "#10b981" }} />
                  <Line type="monotone" dataKey="value" stroke={labConfig.color} strokeWidth={2.5} dot={{ r: 5, fill: labConfig.color, strokeWidth: 2, stroke: "#fff" }} name={labConfig.label} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Data table */}
          <Card className="bg-white border-2 border-slate-200">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-100 border-b">
                    <tr>
                      <th className="px-3 py-2 text-left font-bold text-slate-600">Date</th>
                      <th className="px-3 py-2 text-left font-bold text-slate-600">Value ({labConfig.unit})</th>
                      <th className="px-3 py-2 text-left font-bold text-slate-600">Status</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {labValues.map((row, i) => {
                      const isHigh = row.value > labConfig.refHigh;
                      const isLow = row.value < labConfig.refLow;
                      return (
                        <tr key={i} className={`border-b ${isHigh || isLow ? "bg-red-50" : i % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                          <td className="px-3 py-1.5">{row.date}</td>
                          <td className="px-3 py-1.5 font-bold" style={{ color: isHigh || isLow ? "#dc2626" : "#16a34a" }}>{row.value}</td>
                          <td className="px-3 py-1.5">
                            {isHigh && <Badge className="bg-red-100 text-red-800 text-[10px]">HIGH</Badge>}
                            {isLow && <Badge className="bg-blue-100 text-blue-800 text-[10px]">LOW</Badge>}
                            {!isHigh && !isLow && <Badge className="bg-green-100 text-green-800 text-[10px]">Normal</Badge>}
                          </td>
                          <td className="px-3 py-1.5">
                            <button onClick={() => remove(i)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="text-center py-10 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
          <Activity className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No {labConfig.label} values yet. Add the first reading above.</p>
        </div>
      )}
    </div>
  );
}