import React from "react";
import { auditGuideline, getMissingSections } from "@/lib/guidelines/index";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function GuidelineCompletenessTracker({ guideline, compact = false }) {
  const audit = auditGuideline(guideline);
  const missing = getMissingSections(audit);

  const barColor =
    audit.pct >= 80 ? "bg-green-500" :
    audit.pct >= 55 ? "bg-blue-500" :
    audit.pct >= 30 ? "bg-amber-500" : "bg-slate-400";

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-slate-100 rounded-full h-1.5">
          <div className={`${barColor} h-1.5 rounded-full transition-all`} style={{ width: `${audit.pct}%` }} />
        </div>
        <span className="text-xs text-slate-500 tabular-nums">{audit.pct}%</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Overall bar */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Content Completeness</p>
          <span className="text-sm font-bold text-slate-800">{audit.pct}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5">
          <div className={`${barColor} h-2.5 rounded-full transition-all`} style={{ width: `${audit.pct}%` }} />
        </div>
        <p className="text-xs text-slate-500 mt-1">{audit.filled} of {audit.total} sections complete</p>
      </div>

      {/* Section grid */}
      <div className="grid grid-cols-2 gap-1.5">
        {Object.entries(audit.results).map(([key, { present, label }]) => (
          <div key={key} className={`flex items-center gap-1.5 p-2 rounded-lg text-xs ${present ? "bg-green-50 border border-green-100" : "bg-red-50 border border-red-100"}`}>
            {present
              ? <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
              : <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />}
            <span className={present ? "text-green-800 font-medium" : "text-red-700"}>{label}</span>
          </div>
        ))}
      </div>

      {/* Missing sections */}
      {missing.length > 0 && (
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs font-bold text-amber-800 flex items-center gap-1 mb-1">
            <AlertCircle className="w-3.5 h-3.5" />Missing sections:
          </p>
          <p className="text-xs text-amber-700">{missing.join(" · ")}</p>
        </div>
      )}
    </div>
  );
}