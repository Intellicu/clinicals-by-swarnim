import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp, Minus, AlertTriangle, Activity } from "lucide-react";
import { calculateEgfrSlope, analyzeProteinuriaTrend, analyzeTacrolumusTrend, analyzeGrowthVelocity, ckdProgressionRisk } from "@/lib/clinicalOS/LongitudinalEngine";

const DEMO_EGFR = [
  { date: "2023-01-01", egfr: 52 },
  { date: "2023-07-01", egfr: 47 },
  { date: "2024-01-01", egfr: 41 },
  { date: "2024-07-01", egfr: 36 },
];

const DEMO_UPCR = [
  { date: "2023-01-01", upcr: 350 },
  { date: "2023-07-01", upcr: 280 },
  { date: "2024-01-01", upcr: 520 },
  { date: "2024-07-01", upcr: 890 },
];

const DEMO_GROWTH = [
  { date: "2022-01-01", height_cm: 108, age_years: 7, height_sds: -0.8 },
  { date: "2023-01-01", height_cm: 112, age_years: 8, height_sds: -1.2 },
  { date: "2024-01-01", height_cm: 115, age_years: 9, height_sds: -1.7 },
  { date: "2024-07-01", height_cm: 116.5, age_years: 9.5, height_sds: -1.95 },
];

export default function LongitudinalTrendPanel({ egfrHistory, upcrHistory, growthHistory, taclHistory, indication }) {
  const [activeTab, setActiveTab] = useState("egfr");

  const egfr = egfrHistory || DEMO_EGFR;
  const upcr = upcrHistory || DEMO_UPCR;
  const growth = growthHistory || DEMO_GROWTH;

  const egfrSlope = calculateEgfrSlope(egfr);
  const upcrTrend = analyzeProteinuriaTrend(upcr);
  const growthTrend = analyzeGrowthVelocity(growth);
  const riskScore = ckdProgressionRisk({
    egfr: egfr[egfr.length - 1]?.egfr,
    upcr: upcr[upcr.length - 1]?.upcr,
    systolic_bp_percentile: 92,
  });

  const TrendIcon = ({ trend }) => {
    if (trend === "rapid_decline" || trend === "worsening") return <TrendingDown className="w-4 h-4 text-red-500" />;
    if (trend === "stable_or_improving" || trend === "improving") return <TrendingUp className="w-4 h-4 text-green-500" />;
    return <Minus className="w-4 h-4 text-amber-500" />;
  };

  const TABS = [
    { id: "egfr", label: "eGFR" },
    { id: "proteinuria", label: "Proteinuria" },
    { id: "growth", label: "Growth" },
    { id: "risk", label: "Risk Score" },
  ];

  return (
    <Card className="border-2 border-teal-200 shadow-md">
      <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="w-5 h-5 text-teal-600" />
          Longitudinal Trend Engine
          {!egfrHistory && <Badge className="ml-auto text-xs bg-amber-100 text-amber-700 border-0">Demo Data</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex gap-1 mb-4 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex-shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${activeTab === t.id ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === "egfr" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">eGFR Slope</span>
              <TrendIcon trend={egfrSlope.trend} />
            </div>
            <div className={`p-3 rounded-xl border-2 ${egfrSlope.classification === "RAPID" ? "bg-red-50 border-red-300" : egfrSlope.classification === "MODERATE" ? "bg-amber-50 border-amber-300" : "bg-green-50 border-green-300"}`}>
              <p className="text-2xl font-bold text-slate-900">{egfrSlope.slope_per_year} <span className="text-sm font-normal">mL/min/year</span></p>
              <Badge className={`mt-1 text-xs ${egfrSlope.classification === "RAPID" ? "bg-red-600 text-white" : egfrSlope.classification === "MODERATE" ? "bg-amber-500 text-white" : "bg-green-600 text-white"}`}>
                {egfrSlope.classification} DECLINE
              </Badge>
            </div>
            {egfrSlope.months_to_esrd && (
              <p className="text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2 border">
                At current rate: ESRD in ~<strong>{egfrSlope.months_to_esrd} months</strong> — RRT planning indicated
              </p>
            )}
            {egfrSlope.alert && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-2.5 text-xs text-red-800">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-red-500" />
                {egfrSlope.alert}
              </div>
            )}
            <div className="space-y-1">
              {egfr.map((pt, i) => (
                <div key={i} className="flex items-center justify-between text-xs bg-white border border-slate-100 rounded-lg px-3 py-1.5">
                  <span className="text-slate-500">{pt.date}</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500 rounded-full" style={{ width: `${Math.min(100, (pt.egfr / 90) * 100)}%` }} />
                    </div>
                    <span className="font-bold text-slate-800 w-10 text-right">{pt.egfr}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "proteinuria" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">UPCR Trend</span>
              <TrendIcon trend={upcrTrend.trend} />
            </div>
            <div className={`p-3 rounded-xl border-2 ${upcrTrend.in_nephrotic_range ? "bg-red-50 border-red-300" : upcrTrend.in_remission ? "bg-green-50 border-green-300" : "bg-amber-50 border-amber-300"}`}>
              <p className="text-2xl font-bold text-slate-900">{upcrTrend.latest_upcr} <span className="text-sm font-normal">mg/g</span></p>
              <Badge className={`mt-1 text-xs ${upcrTrend.in_nephrotic_range ? "bg-red-600 text-white" : upcrTrend.in_remission ? "bg-green-600 text-white" : "bg-amber-500 text-white"}`}>
                {upcrTrend.in_nephrotic_range ? "NEPHROTIC RANGE" : upcrTrend.in_remission ? "REMISSION" : "PROTEINURIC"}
              </Badge>
            </div>
            {upcrTrend.alert && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-2.5 text-xs text-red-800">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                {upcrTrend.alert}
              </div>
            )}
            <div className="space-y-1">
              {upcr.map((pt, i) => (
                <div key={i} className="flex items-center justify-between text-xs bg-white border border-slate-100 rounded-lg px-3 py-1.5">
                  <span className="text-slate-500">{pt.date}</span>
                  <span className={`font-bold ${pt.upcr > 2000 ? "text-red-700" : pt.upcr < 200 ? "text-green-700" : "text-amber-700"}`}>{pt.upcr} mg/g</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "growth" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Growth Velocity</span>
              <TrendIcon trend={growthTrend.height_velocity_cm_yr > 4 ? "stable_or_improving" : "worsening"} />
            </div>
            <div className={`p-3 rounded-xl border-2 ${growthTrend.poor_growth ? "bg-red-50 border-red-300" : "bg-green-50 border-green-300"}`}>
              <p className="text-2xl font-bold text-slate-900">
                {growthTrend.height_velocity_cm_yr} <span className="text-sm font-normal">cm/year</span>
              </p>
              <p className="text-sm text-slate-600 mt-0.5">Height SDS: <strong>{growthTrend.height_sds_latest}</strong></p>
              {growthTrend.rgh_eligible && (
                <Badge className="mt-1 bg-orange-500 text-white text-xs">rhGH ELIGIBLE</Badge>
              )}
            </div>
            {growthTrend.alert && (
              <div className="flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-xl p-2.5 text-xs text-orange-800">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                {growthTrend.alert}
              </div>
            )}
          </div>
        )}

        {activeTab === "risk" && (
          <div className="space-y-3">
            <div className={`p-4 rounded-xl border-2 text-center ${riskScore.risk === "HIGH" ? "bg-red-50 border-red-300" : riskScore.risk === "MODERATE" ? "bg-amber-50 border-amber-300" : "bg-green-50 border-green-300"}`}>
              <p className="text-xs text-slate-500 mb-1">CKD Progression Risk Score</p>
              <p className="text-4xl font-bold text-slate-900 mb-1">{riskScore.score}</p>
              <Badge className={`text-sm px-3 py-1 ${riskScore.risk === "HIGH" ? "bg-red-600 text-white" : riskScore.risk === "MODERATE" ? "bg-amber-500 text-white" : "bg-green-600 text-white"}`}>
                {riskScore.risk} RISK
              </Badge>
            </div>
            <p className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3 leading-relaxed">{riskScore.recommendation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}