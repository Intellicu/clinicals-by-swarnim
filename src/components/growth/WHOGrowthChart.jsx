import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceDot, ResponsiveContainer } from "recharts";
import { getWHOCentileLines } from "./WHOZScoreEngine";
import { Badge } from "@/components/ui/badge";

const CENTILE_COLORS = {
  p3: "#ef4444", p15: "#f97316", p50: "#10b981", p85: "#f97316", p97: "#ef4444"
};
const CENTILE_LABELS = { p3: "3rd", p15: "15th", p50: "50th", p85: "85th", p97: "97th" };
const CENTILE_DASH = { p3: "4 2", p15: "2 2", p50: "0", p85: "2 2", p97: "4 2" };

export default function WHOGrowthChart({ sex, ageMonths, weight, height, type = "WAZ" }) {
  const centiles = getWHOCentileLines(sex, type, [0, 60]);

  // Merge centile data into unified array by age
  const agePoints = [...new Set(Object.values(centiles).flatMap(arr => arr.map(d => d.age)))].sort((a, b) => a - b);
  const chartData = agePoints.map(age => {
    const row = { age };
    Object.entries(centiles).forEach(([key, arr]) => {
      const pt = arr.find(d => d.age === age);
      if (pt) row[key] = pt.value;
    });
    return row;
  });

  // Patient point
  const patientAge = ageMonths;
  let patientValue = null;
  if (type === "WAZ") patientValue = parseFloat(weight) || null;
  if (type === "HAZ") patientValue = parseFloat(height) || null;

  const yLabel = type === "WAZ" ? "Weight (kg)" : "Height (cm)";
  const title = type === "WAZ" ? "Weight-for-Age Chart" : "Height-for-Age Chart";

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-900 text-sm">{title} — WHO Standards ({sex === 'male' ? 'Boys' : 'Girls'})</h3>
        <div className="flex gap-1">
          {Object.entries(CENTILE_LABELS).map(([k, l]) => (
            <Badge key={k} variant="outline" className="text-xs px-1.5 py-0.5" style={{ borderColor: CENTILE_COLORS[k], color: CENTILE_COLORS[k] }}>
              {l}
            </Badge>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, left: -10, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="age" label={{ value: "Age (months)", position: "insideBottom", offset: -2, fontSize: 10 }} tick={{ fontSize: 10 }} />
          <YAxis label={{ value: yLabel, angle: -90, position: "insideLeft", offset: 8, fontSize: 10 }} tick={{ fontSize: 10 }} />
          <Tooltip formatter={(val, name) => [val?.toFixed(1), CENTILE_LABELS[name] || name]} labelFormatter={l => `Age: ${l}m`} />
          {Object.entries(CENTILE_COLORS).map(([key, color]) => (
            <Line key={key} type="monotone" dataKey={key} stroke={color} strokeWidth={key === 'p50' ? 2 : 1}
              strokeDasharray={CENTILE_DASH[key]} dot={false} name={key} />
          ))}
          {patientValue !== null && patientAge !== null && (
            <ReferenceDot x={patientAge} y={patientValue} r={7} fill="#6366f1" stroke="white" strokeWidth={2}
              label={{ value: "●", position: "top", fontSize: 12, fill: "#6366f1" }} />
          )}
        </LineChart>
      </ResponsiveContainer>
      {patientValue && (
        <p className="text-xs text-center text-indigo-700 mt-1 font-semibold">
          ● Patient: {patientValue} {type === 'WAZ' ? 'kg' : 'cm'} at {patientAge}m
        </p>
      )}
    </div>
  );
}