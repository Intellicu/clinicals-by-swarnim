/**
 * TDM Trend Dashboard
 * Pulls from AnalysisResult + ClinicalEncounter records.
 * Shows patient-specific trough level trends against target range.
 */
import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ReferenceArea, ResponsiveContainer, Legend
} from "recharts";
import { TrendingUp, Activity, AlertTriangle, CheckCircle, User, Loader2 } from "lucide-react";
import moment from "moment";

// Drug target trough ranges (mg/dL or ng/mL as labelled)
const TARGET_RANGES = {
  tacrolimus: { lo: 5, hi: 12, unit: "ng/mL", label: "Tacrolimus C0" },
  cyclosporine: { lo: 80, hi: 150, unit: "ng/mL", label: "Cyclosporine C0" },
  sirolimus: { lo: 4, hi: 12, unit: "ng/mL", label: "Sirolimus C0" },
  vancomycin: { lo: 10, hi: 20, unit: "mg/L", label: "Vancomycin Trough" },
  gentamicin: { lo: 0, hi: 2, unit: "mg/L", label: "Gentamicin Trough" },
};

const DRUG_OPTIONS = [
  { value: "tacrolimus", label: "Tacrolimus" },
  { value: "cyclosporine", label: "Cyclosporine" },
  { value: "sirolimus", label: "Sirolimus" },
  { value: "vancomycin", label: "Vancomycin" },
  { value: "gentamicin", label: "Gentamicin" },
];

function StatusBadge({ value, target }) {
  if (!target || value == null) return null;
  if (value < target.lo) return <Badge className="bg-blue-100 text-blue-800 text-[10px]">Below Target</Badge>;
  if (value > target.hi) return <Badge className="bg-red-100 text-red-800 text-[10px]">Above Target</Badge>;
  return <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">In Range</Badge>;
}

const CustomTooltip = ({ active, payload, label, target }) => {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2 text-xs space-y-1">
      <p className="font-bold text-slate-700">{label}</p>
      <p className="text-indigo-700 font-semibold">Level: <strong>{val} {target?.unit}</strong></p>
      {target && (
        <p className="text-slate-500">Target: {target.lo}–{target.hi} {target.unit}</p>
      )}
      {val != null && target && (
        val < target.lo ? <p className="text-blue-600">↓ Below target</p>
        : val > target.hi ? <p className="text-red-600">↑ Above target</p>
        : <p className="text-emerald-600">✓ In target range</p>
      )}
    </div>
  );
};

export default function TDMTrendDashboard() {
  const [analysisResults, setAnalysisResults] = useState([]);
  const [encounters, setEncounters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDrug, setSelectedDrug] = useState("tacrolimus");
  const [selectedPatientId, setSelectedPatientId] = useState("all");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [ar, enc] = await Promise.all([
          base44.entities.AnalysisResult.list("-created_date", 200),
          base44.entities.ClinicalEncounter.list("-encounter_date", 200),
        ]);
        setAnalysisResults(ar);
        setEncounters(enc);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Extract TDM data points from AnalysisResult
  const tdmPoints = useMemo(() => {
    const points = [];
    for (const ar of analysisResults) {
      const results = ar.results || {};
      const drugKey = selectedDrug.toLowerCase();
      // Look for the drug value in results object (any matching key)
      for (const [key, val] of Object.entries(results)) {
        if (key.toLowerCase().includes(drugKey) && typeof val === "number") {
          points.push({
            date: moment(ar.created_date).format("DD MMM"),
            fullDate: ar.created_date,
            value: val,
            patientId: ar.project_id,
            source: "AnalysisResult",
            id: ar.id,
          });
        }
      }
      // Also check ai_interpretation for trough values
      if (ar.ai_interpretation && ar.ai_interpretation.toLowerCase().includes(drugKey)) {
        const match = ar.ai_interpretation.match(new RegExp(`${drugKey}[^\\d]*(\\d+\\.?\\d*)`, "i"));
        if (match && !points.find(p => p.id === ar.id)) {
          points.push({
            date: moment(ar.created_date).format("DD MMM"),
            fullDate: ar.created_date,
            value: parseFloat(match[1]),
            patientId: ar.project_id,
            source: "AnalysisResult",
            id: ar.id,
          });
        }
      }
    }

    // Also extract from ClinicalEncounter monitoring summary
    for (const enc of encounters) {
      const ms = enc.monitoring_summary || {};
      const drugKey = selectedDrug.toLowerCase();
      for (const [key, val] of Object.entries(ms)) {
        if (key.toLowerCase().includes(drugKey) && typeof val === "number") {
          points.push({
            date: moment(enc.encounter_date).format("DD MMM"),
            fullDate: enc.encounter_date,
            value: val,
            patientId: enc.patient_id,
            source: "ClinicalEncounter",
            id: enc.id,
          });
        }
      }
    }

    // Sort by date
    return points.sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));
  }, [analysisResults, encounters, selectedDrug]);

  const patientIds = useMemo(() => {
    const ids = [...new Set(tdmPoints.map(p => p.patientId).filter(Boolean))];
    return ids;
  }, [tdmPoints]);

  const filteredPoints = useMemo(() => {
    if (selectedPatientId === "all") return tdmPoints;
    return tdmPoints.filter(p => p.patientId === selectedPatientId);
  }, [tdmPoints, selectedPatientId]);

  const target = TARGET_RANGES[selectedDrug];

  // Stats
  const inRange = filteredPoints.filter(p => target && p.value >= target.lo && p.value <= target.hi).length;
  const aboveRange = filteredPoints.filter(p => target && p.value > target.hi).length;
  const belowRange = filteredPoints.filter(p => target && p.value < target.lo).length;
  const latest = filteredPoints[filteredPoints.length - 1];
  const trend = filteredPoints.length >= 2
    ? filteredPoints[filteredPoints.length - 1].value - filteredPoints[filteredPoints.length - 2].value
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3 text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Loading TDM data...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">TDM Trend Dashboard</h1>
          <p className="text-sm text-slate-500">Therapeutic Drug Monitoring — trough levels vs target ranges</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[180px]">
          <label className="text-xs font-semibold text-slate-500 block mb-1">Drug</label>
          <Select value={selectedDrug} onValueChange={setSelectedDrug}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DRUG_OPTIONS.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="text-xs font-semibold text-slate-500 block mb-1">Patient</label>
          <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Patients</SelectItem>
              {patientIds.map(id => (
                <SelectItem key={id} value={id}>
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" /> {id.slice(0, 8)}...
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary cards */}
      {filteredPoints.length > 0 && target && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-white border shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500 mb-1">Latest Level</p>
              <p className="text-2xl font-bold text-indigo-700">{latest?.value ?? "—"}</p>
              <p className="text-xs text-slate-400">{target.unit}</p>
              {latest && <StatusBadge value={latest.value} target={target} />}
            </CardContent>
          </Card>
          <Card className="bg-emerald-50 border-emerald-200 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-emerald-700 mb-1">In Range</p>
              <p className="text-2xl font-bold text-emerald-700">{inRange}</p>
              <p className="text-xs text-slate-400">of {filteredPoints.length} readings</p>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-red-700 mb-1">Above Target</p>
              <p className="text-2xl font-bold text-red-700">{aboveRange}</p>
              <p className="text-xs text-slate-400">toxic risk</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-200 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-blue-700 mb-1">Below Target</p>
              <p className="text-2xl font-bold text-blue-700">{belowRange}</p>
              <p className="text-xs text-slate-400">under-therapeutic</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trend chart */}
      <Card className="bg-white border shadow-sm">
        <CardHeader className="pb-2 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              {target?.label || selectedDrug} Trend
            </CardTitle>
            {target && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="w-3 h-1 bg-green-400 inline-block rounded" />
                Target: {target.lo}–{target.hi} {target.unit}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {filteredPoints.length === 0 ? (
            <div className="text-center py-16">
              <TrendingUp className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No TDM data found for {selectedDrug}</p>
              <p className="text-slate-300 text-xs mt-1">
                Data is pulled from AnalysisResult and ClinicalEncounter records containing {selectedDrug} level values.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filteredPoints} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit={` ${target?.unit || ""}`} />
                <Tooltip content={<CustomTooltip target={target} />} />
                {target && (
                  <ReferenceArea
                    y1={target.lo} y2={target.hi}
                    fill="#22c55e" fillOpacity={0.08}
                    stroke="#22c55e" strokeOpacity={0.3}
                  />
                )}
                {target && (
                  <>
                    <ReferenceLine y={target.lo} stroke="#22c55e" strokeDasharray="4 2" strokeOpacity={0.7} />
                    <ReferenceLine y={target.hi} stroke="#22c55e" strokeDasharray="4 2" strokeOpacity={0.7} />
                  </>
                )}
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={{ r: 5, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 7 }}
                  name={target?.label || selectedDrug}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Recent readings table */}
      {filteredPoints.length > 0 && (
        <Card className="bg-white border shadow-sm">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-sm font-bold text-slate-800">Recent Readings</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500">Date</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500">Level</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500">Status</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500">Source</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500">Patient</th>
                  </tr>
                </thead>
                <tbody>
                  {[...filteredPoints].reverse().slice(0, 20).map((p, i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-4 py-2 text-xs text-slate-700">{p.date}</td>
                      <td className="px-4 py-2 text-xs font-bold text-indigo-700">
                        {p.value} {target?.unit}
                      </td>
                      <td className="px-4 py-2">
                        <StatusBadge value={p.value} target={target} />
                      </td>
                      <td className="px-4 py-2 text-xs text-slate-400">{p.source}</td>
                      <td className="px-4 py-2 text-xs text-slate-400 font-mono">{p.patientId?.slice(0, 8) || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clinical decision support */}
      {latest && target && (
        <Alert className={`border ${latest.value > target.hi ? "bg-red-50 border-red-300" : latest.value < target.lo ? "bg-blue-50 border-blue-300" : "bg-emerald-50 border-emerald-300"}`}>
          {latest.value > target.hi
            ? <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
            : latest.value < target.lo
            ? <AlertTriangle className="w-4 h-4 text-blue-600 flex-shrink-0" />
            : <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
          <AlertDescription className="text-xs">
            {latest.value > target.hi
              ? <><strong>Latest level above target range.</strong> Consider dose reduction; monitor for toxicity signs (nephrotoxicity, neurotoxicity). Repeat level in 3–5 days after adjustment.</>
              : latest.value < target.lo
              ? <><strong>Latest level below target range.</strong> Consider dose increase; check adherence and drug interactions. Repeat level 5–7 days after adjustment.</>
              : <><strong>Latest level within target range.</strong> Continue current dose. Routine monitoring per schedule.</>}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}