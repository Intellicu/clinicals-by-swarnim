import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ChevronDown, ChevronUp, FlaskConical, ArrowRight } from "lucide-react";

const RISK_COLORS = {
  "Very High": "bg-red-100 text-red-800 border-red-300",
  "High": "bg-orange-100 text-orange-800 border-orange-200",
  "Moderate-High": "bg-amber-100 text-amber-800 border-amber-200",
  "Moderate (if uncontrolled)": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Moderate": "bg-yellow-100 text-yellow-800 border-yellow-200",
};

function OverlapCard({ overlap }) {
  const [expanded, setExpanded] = useState(false);
  const riskColor = RISK_COLORS[overlap.risk] || "bg-slate-100 text-slate-700";

  return (
    <div className="bg-white rounded-xl border-2 border-slate-200 hover:border-red-200 overflow-hidden transition-all">
      <button className="w-full p-3 text-left" onClick={() => setExpanded(e => !e)}>
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <Badge className={`text-xs border ${riskColor}`}>{overlap.risk} Risk</Badge>
              <Badge variant="outline" className="text-xs">{overlap.rheum_disease}</Badge>
            </div>
            <p className="font-semibold text-slate-900 text-sm">{overlap.condition}</p>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />}
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 border-t border-slate-100 pt-2 space-y-2">
          {/* Key points */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Key Clinical Points</p>
            <div className="space-y-1.5">
              {overlap.key_points.map((point, i) => (
                <div key={i} className="flex items-start gap-2">
                  <ArrowRight className="w-3 h-3 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-700 leading-relaxed">{point}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency flags */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-2.5">
            <p className="text-xs font-bold text-red-700 mb-1.5 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />Emergency / Urgent Flags
            </p>
            {overlap.emergency_flags.map((f, i) => (
              <p key={i} className="text-xs text-red-800">• {f}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function RheumNephrologyOverlap({ overlaps }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-3 flex items-start gap-2">
        <FlaskConical className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-purple-900">Rheumatology–Nephrology Overlap</p>
          <p className="text-xs text-purple-700 mt-0.5">Critical renal involvement patterns in pediatric rheumatic diseases — requires joint management</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Very High Risk", count: overlaps.filter(o => o.risk === "Very High").length, color: "bg-red-50 border-red-200 text-red-700" },
          { label: "High Risk", count: overlaps.filter(o => o.risk === "High").length, color: "bg-orange-50 border-orange-200 text-orange-700" },
          { label: "Moderate Risk", count: overlaps.filter(o => !["Very High", "High"].includes(o.risk)).length, color: "bg-amber-50 border-amber-200 text-amber-700" },
        ].map(s => (
          <div key={s.label} className={`p-2 rounded-xl border-2 text-center ${s.color}`}>
            <p className="text-xl font-bold">{s.count}</p>
            <p className="text-xs font-semibold leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2.5">
        {overlaps.map((o, i) => (
          <OverlapCard key={i} overlap={o} />
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800 leading-relaxed">
        <strong>Note:</strong> Renal involvement in rheumatic diseases requires coordinated rheumatology–nephrology care. Timely renal biopsy, appropriate immunosuppression, and monitoring are critical for outcome.
      </div>
    </div>
  );
}