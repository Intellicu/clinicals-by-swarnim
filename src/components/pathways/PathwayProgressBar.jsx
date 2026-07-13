/**
 * PathwayProgressBar — simple visual indicator of which treatment step a
 * patient is on within a clinical pathway.
 */
import React from "react";

export default function PathwayProgressBar({ completed = 0, total = 1, done = false }) {
  const pct = done ? 100 : Math.min(95, Math.round((completed / Math.max(total, 1)) * 100));
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2.5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Treatment progress</span>
        <span className={`text-[11px] font-bold ${done ? "text-emerald-700" : "text-violet-700"}`}>
          {done ? "Complete" : `Step ${completed + 1}`}
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${done ? "bg-emerald-500" : "bg-violet-600"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {!done && (
        <p className="text-[10px] text-slate-400 mt-1">{completed} step{completed === 1 ? "" : "s"} completed</p>
      )}
    </div>
  );
}