import React from "react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";
import { zToCentile } from "./WHOZScoreEngine";

const colorMap = {
  red: { badge: "bg-red-100 text-red-800 border-red-300", bar: "bg-red-500" },
  amber: { badge: "bg-amber-100 text-amber-800 border-amber-300", bar: "bg-amber-500" },
  orange: { badge: "bg-orange-100 text-orange-800 border-orange-300", bar: "bg-orange-500" },
  green: { badge: "bg-green-100 text-green-800 border-green-300", bar: "bg-green-500" },
  blue: { badge: "bg-blue-100 text-blue-800 border-blue-300", bar: "bg-blue-500" },
  gray: { badge: "bg-gray-100 text-gray-700 border-gray-300", bar: "bg-gray-400" },
};

function ZBar({ z }) {
  if (z === null) return <div className="text-xs text-slate-400">N/A</div>;
  // Map z from -4 to +4 → 0 to 100%
  const pct = Math.max(0, Math.min(100, ((z + 4) / 8) * 100));
  const color = z < -2 ? "bg-red-500" : z < -1 ? "bg-amber-500" : z > 2 ? "bg-orange-500" : "bg-green-500";
  return (
    <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden mt-1">
      {/* Reference lines at -2, -1, 0, +1, +2 */}
      {[-2, -1, 0, 1, 2].map(ref => (
        <div key={ref} className="absolute top-0 bottom-0 w-px bg-slate-400 opacity-40"
          style={{ left: `${((ref + 4) / 8) * 100}%` }} />
      ))}
      <div className={`absolute top-0 bottom-0 w-2.5 h-2.5 rounded-full ${color} border-2 border-white shadow`}
        style={{ left: `calc(${pct}% - 5px)`, top: 0 }} />
    </div>
  );
}

export default function GrowthZScorePanel({ waz, haz, whz, baz, interpretations }) {
  const metrics = [
    { key: "WAZ", label: "Weight-for-Age", z: waz, interp: interpretations?.WAZ, unit: "Z" },
    { key: "HAZ", label: "Height-for-Age", z: haz, interp: interpretations?.HAZ, unit: "Z" },
    { key: "WHZ", label: "Weight-for-Height", z: whz, interp: interpretations?.WHZ, unit: "Z" },
    { key: "BAZ", label: "BMI-for-Age", z: baz, interp: interpretations?.BAZ, unit: "Z" },
  ];

  const hasSevere = metrics.some(m => m.interp?.severity === 'severe');
  const hasModerate = metrics.some(m => m.interp?.severity === 'moderate');

  return (
    <div className="space-y-4">
      {/* Summary alert */}
      {hasSevere && (
        <Alert className="bg-red-50 border-red-300 border-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-900 font-semibold">
            ⚠️ Severe malnutrition detected — urgent nutritional assessment and intervention required.
          </AlertDescription>
        </Alert>
      )}
      {!hasSevere && hasModerate && (
        <Alert className="bg-amber-50 border-amber-300">
          <Info className="w-4 h-4 text-amber-600" />
          <AlertDescription className="text-amber-900">
            Moderate nutritional concern identified — nutritional counselling recommended.
          </AlertDescription>
        </Alert>
      )}
      {!hasSevere && !hasModerate && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-900">
            Growth parameters within normal range (WHO standards).
          </AlertDescription>
        </Alert>
      )}

      {/* Z-score cards */}
      <div className="grid grid-cols-2 gap-3">
        {metrics.map(({ key, label, z, interp }) => {
          const colors = colorMap[interp?.color || 'gray'];
          const centile = zToCentile(z);
          return (
            <div key={key} className={`rounded-xl border-2 p-3 ${colors.badge}`}>
              <p className="text-xs font-bold uppercase tracking-wide opacity-70 mb-1">{label}</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold">
                  {z !== null ? (z > 0 ? `+${z.toFixed(2)}` : z.toFixed(2)) : 'N/A'}
                </span>
                {centile !== null && (
                  <span className="text-xs font-medium opacity-80 mb-0.5">{centile}th %ile</span>
                )}
              </div>
              <ZBar z={z} />
              <p className="text-xs font-semibold mt-1.5">{interp?.label || '—'}</p>
            </div>
          );
        })}
      </div>

      {/* WHO Z-score scale reference */}
      <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
        <p className="text-xs font-semibold text-slate-600 mb-2">WHO Z-Score Scale Reference</p>
        <div className="relative h-4 bg-gradient-to-r from-red-400 via-green-400 to-orange-400 rounded-full overflow-hidden">
          {[-3, -2, -1, 0, 1, 2, 3].map(z => (
            <div key={z} className="absolute top-0 bottom-0 flex flex-col items-center"
              style={{ left: `${((z + 4) / 8) * 100}%` }}>
              <div className="w-px h-full bg-white opacity-60" />
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>-4 (Severe)</span><span>-2</span><span>0 (Median)</span><span>+2</span><span>+4</span>
        </div>
      </div>

      {/* WHO classification note */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-red-50 border border-red-200 rounded p-2">
          <strong className="text-red-800">Z &lt; -3:</strong><span className="text-red-700"> Severe malnutrition</span>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded p-2">
          <strong className="text-amber-800">Z &lt; -2:</strong><span className="text-amber-700"> Moderate concern</span>
        </div>
        <div className="bg-green-50 border border-green-200 rounded p-2">
          <strong className="text-green-800">-2 to +2:</strong><span className="text-green-700"> Normal range</span>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded p-2">
          <strong className="text-orange-800">Z &gt; +2:</strong><span className="text-orange-700"> Overweight risk</span>
        </div>
      </div>
    </div>
  );
}