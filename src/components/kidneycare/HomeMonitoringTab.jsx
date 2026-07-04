import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, subDays, differenceInDays, parseISO } from "date-fns";
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip,
  ReferenceLine, ResponsiveContainer, CartesianGrid
} from "recharts";
import {
  AlertTriangle, CheckCircle, Bell, ClipboardList, Copy, Loader2,
  MessageSquare, Image as ImageIcon, Mic, BarChart2, X
} from "lucide-react";
import { toast } from "sonner";

// ─── helpers ────────────────────────────────────────────────────────────────
const PROTEIN_MAP = { "Negative": 0, "Trace": 0.5, "1+": 1, "2+": 2, "3+": 3, "4+": 4 };
const PROTEIN_LABELS = ["Neg", "Trace", "1+", "2+", "3+", "4+"];
const PROTEIN_VAL_TO_LABEL = { 0: "Neg", 0.5: "Trace", 1: "1+", 2: "2+", 3: "3+", 4: "4+" };
function proteinColor(v) {
  if (v === undefined || v === null) return "#94a3b8";
  if (v <= 0.5) return "#22c55e";
  if (v === 1) return "#f59e0b";
  if (v === 2) return "#f97316";
  return "#ef4444";
}

// ─── Alert Banner ────────────────────────────────────────────────────────────
function AlertBanner({ patientId, onOpenRelapse }) {
  const queryClient = useQueryClient();
  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["patient-alerts", patientId],
    queryFn: () => base44.entities.MonitoringAlert.filter({ patient_id: patientId, acknowledged: false }, "-generated_at", 20),
    refetchInterval: 30000,
  });

  const acknowledge = async (alertId) => {
    const user = await base44.auth.me();
    await base44.entities.MonitoringAlert.update(alertId, {
      acknowledged: true, acknowledged_by: user.email, acknowledged_at: new Date().toISOString()
    });
    queryClient.invalidateQueries({ queryKey: ["patient-alerts", patientId] });
    toast.success("Alert acknowledged");
  };

  const { data: lastLog } = useQuery({
    queryKey: ["last-daily-log", patientId],
    queryFn: () => base44.entities.PatientDailyLog.filter({ patient_id: patientId }, "-log_date", 1),
  });

  if (isLoading) return null;

  const hasCritical = alerts.some(a => a.priority === "Critical");
  const hasHigh = alerts.some(a => a.priority === "High");

  if (alerts.length === 0) {
    const lastDate = lastLog?.[0]?.log_date;
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200">
        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
        <span className="text-sm text-green-800 font-medium">
          No active alerts {lastDate ? `— Last log: ${format(parseISO(lastDate), "dd MMM")}` : ""}
        </span>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border-2 p-3 space-y-2 ${hasCritical ? "bg-red-50 border-red-500" : "bg-amber-50 border-amber-400"}`}>
      <div className="flex items-center gap-2">
        {hasCritical && <span className="animate-pulse text-red-600">🚨</span>}
        <p className={`font-bold text-sm ${hasCritical ? "text-red-800" : "text-amber-800"}`}>
          {alerts.length} unacknowledged alert{alerts.length > 1 ? "s" : ""} — action required
        </p>
      </div>
      <div className="space-y-2">
        {alerts.map(alert => (
          <div key={alert.id} className="bg-white rounded-lg p-2.5 border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge className={`text-xs border-0 ${alert.priority === "Critical" ? "bg-red-100 text-red-800" : alert.priority === "High" ? "bg-orange-100 text-orange-800" : "bg-yellow-100 text-yellow-800"}`}>
                {alert.priority}
              </Badge>
              <span className="text-xs font-semibold text-slate-700">{alert.alert_type?.replace(/_/g, " ")}</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{alert.message}</p>
            <div className="flex gap-1.5 flex-wrap">
              <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => acknowledge(alert.id)}>
                <CheckCircle className="w-3 h-3 mr-1" /> Acknowledge
              </Button>
              {alert.alert_type === "Relapse_Suspected" && (
                <Button size="sm" className="h-6 text-xs bg-red-600 hover:bg-red-700 text-white" onClick={() => onOpenRelapse(alert)}>
                  <ClipboardList className="w-3 h-3 mr-1" /> Open Relapse Episode
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Protein Trend Chart ─────────────────────────────────────────────────────
function ProteinChart({ logs, aiResults }) {
  const aiMap = useMemo(() => {
    const m = {};
    (aiResults || []).forEach(r => {
      const d = r.capture_timestamp?.split("T")[0];
      if (d) m[d] = r;
    });
    return m;
  }, [aiResults]);

  const data = useMemo(() => {
    const proteinLogs = (logs || []).filter(l => l.module_type === "Urine_Protein");
    return proteinLogs.map(l => ({
      date: l.log_date,
      value: PROTEIN_MAP[l.protein_result] ?? null,
      label: l.protein_result,
      source: l.source === "AI" ? "WA" : "Lab",
      confidence: aiMap[l.log_date]?.confidence_score != null
        ? Math.round(aiMap[l.log_date].confidence_score * 100) + "%"
        : null,
    })).sort((a, b) => a.date.localeCompare(b.date));
  }, [logs, aiMap]);

  // 30-day heatmap
  const heatDays = useMemo(() => {
    const map = {};
    data.forEach(d => { map[d.date] = d.value; });
    return Array.from({ length: 30 }, (_, i) => {
      const d = format(subDays(new Date(), 29 - i), "yyyy-MM-dd");
      return { date: d, value: map[d] };
    });
  }, [data]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <BarChart2 className="w-4 h-4 text-slate-600" />
        <p className="text-xs font-bold text-slate-700">Urine Protein — 30 Days</p>
        <Badge variant="outline" className="text-xs ml-auto">Relapse threshold ≥ 2+</Badge>
      </div>
      <ResponsiveContainer width="100%" height={150}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="date" tick={{ fontSize: 9 }} tickFormatter={d => format(parseISO(d), "dd/M")} />
          <YAxis domain={[0, 4]} ticks={[0, 0.5, 1, 2, 3, 4]} tickFormatter={v => PROTEIN_VAL_TO_LABEL[v] || ""} tick={{ fontSize: 9 }} />
          <Tooltip content={({ active, payload }) => {
            if (!active || !payload?.[0]) return null;
            const d = payload[0].payload;
            return (
              <div className="bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs shadow-lg">
                <p className="font-bold">{d.date}</p>
                <p>Result: <span className="font-semibold">{d.label}</span></p>
                {d.confidence && <p>AI Confidence: {d.confidence}</p>}
                <p>Source: <Badge variant="outline" className="text-xs py-0">{d.source}</Badge></p>
              </div>
            );
          }} />
          <ReferenceLine y={2} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "Relapse", fontSize: 9, fill: "#ef4444" }} />
          <Area type="monotone" dataKey="value" stroke="#6366f1" fill="#eef2ff" strokeWidth={2}
            dot={({ cx, cy, payload }) => (
              <circle key={payload.date} cx={cx} cy={cy} r={4}
                fill={proteinColor(payload.value)} stroke="white" strokeWidth={1.5} />
            )} />
        </AreaChart>
      </ResponsiveContainer>
      {/* Heatmap strip */}
      <div className="flex gap-0.5 flex-wrap">
        {heatDays.map(d => (
          <div key={d.date} title={`${d.date}: ${d.value != null ? PROTEIN_VAL_TO_LABEL[d.value] : "No data"}`}
            style={{ backgroundColor: proteinColor(d.value), opacity: d.value != null ? 1 : 0.2 }}
            className="w-[calc((100%-116px)/30)] min-w-[7px] h-5 rounded-sm cursor-pointer transition-opacity" />
        ))}
      </div>
      <p className="text-xs text-slate-400 text-center">30-day protein heatmap (hover for date)</p>
    </div>
  );
}

// ─── BP Trend Chart ──────────────────────────────────────────────────────────
function BPChart({ logs, patientDob }) {
  const bpLogs = useMemo(() => (logs || []).filter(l => l.module_type === "Blood_Pressure")
    .sort((a, b) => a.log_date.localeCompare(b.log_date)), [logs]);

  const ageYears = patientDob
    ? Math.floor(differenceInDays(new Date(), parseISO(patientDob)) / 365.25)
    : 10;
  const stage1Sys = Math.round(100 + Math.min(ageYears, 13) * 1.5);

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-slate-700">Blood Pressure Trend</p>
      {bpLogs.length === 0 ? (
        <p className="text-xs text-slate-400 italic py-4 text-center">No BP data logged yet</p>
      ) : (
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={bpLogs} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="log_date" tick={{ fontSize: 9 }} tickFormatter={d => format(parseISO(d), "dd/M")} />
            <YAxis domain={[40, 180]} tick={{ fontSize: 9 }} />
            <Tooltip formatter={(v, name) => [v, name === "bp_systolic" ? "Systolic" : "Diastolic"]}
              labelFormatter={d => format(parseISO(d), "dd MMM")} />
            <ReferenceLine y={stage1Sys} stroke="#f97316" strokeDasharray="4 4"
              label={{ value: "Stage 1", fontSize: 9, fill: "#f97316" }} />
            <Line type="monotone" dataKey="bp_systolic" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name="Systolic" />
            <Line type="monotone" dataKey="bp_diastolic" stroke="#14b8a6" strokeWidth={2} dot={{ r: 3 }} name="Diastolic" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

// ─── Medication Compliance Calendar ─────────────────────────────────────────
function MedCalendar({ logs }) {
  const medLogs = useMemo(() => {
    const map = {};
    (logs || []).filter(l => l.module_type === "Medications").forEach(l => { map[l.log_date] = l; });
    return map;
  }, [logs]);

  const days = Array.from({ length: 30 }, (_, i) => format(subDays(new Date(), 29 - i), "yyyy-MM-dd"));
  const taken = days.filter(d => medLogs[d]?.value?.taken === true).length;
  const missed = days.filter(d => medLogs[d] && medLogs[d]?.value?.taken === false).length;
  const noData = days.filter(d => !medLogs[d]).length;
  const pct = days.length > 0 ? Math.round((taken / days.length) * 100) : 0;

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-slate-700">Medication Compliance — 30 Days</p>
      <div className="flex gap-0.5 flex-wrap">
        {days.map(d => {
          const log = medLogs[d];
          const bg = !log ? "#e2e8f0" : log.value?.taken ? "#22c55e" : "#ef4444";
          return (
            <div key={d} title={`${d}: ${!log ? "No data" : log.value?.taken ? "Taken" : "Missed"}`}
              style={{ backgroundColor: bg }}
              className="w-[calc((100%-116px)/30)] min-w-[7px] h-6 rounded-sm cursor-pointer" />
          );
        })}
      </div>
      <div className="flex gap-3 text-xs text-slate-600">
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded-sm inline-block" />Taken: {taken}</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded-sm inline-block" />Missed: {missed}</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-slate-200 rounded-sm inline-block" />No data: {noData}</span>
        <span className="ml-auto font-bold text-slate-800">{pct}% compliant</span>
      </div>
    </div>
  );
}

// ─── WhatsApp Thread ─────────────────────────────────────────────────────────
function WAThread({ patientId }) {
  const { data: msgs = [], isLoading } = useQuery({
    queryKey: ["wa-thread", patientId],
    queryFn: () => base44.entities.WhatsAppMessageLog.filter({ patient_id: patientId }, "-message_timestamp", 50),
  });

  if (isLoading) return <div className="py-6 text-center"><Loader2 className="w-5 h-5 animate-spin text-slate-400 mx-auto" /></div>;
  if (msgs.length === 0) return <p className="text-xs text-slate-400 italic text-center py-6">No WhatsApp messages yet</p>;

  return (
    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
      {[...msgs].reverse().map(msg => {
        const isOut = msg.direction === "Outbound";
        const de = msg.data_extracted;
        const hasData = de && Object.values(de).some(v => v != null && v !== false && (Array.isArray(v) ? v.length > 0 : true));
        return (
          <div key={msg.id} className={`flex ${isOut ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs space-y-1 ${isOut ? "bg-slate-100 text-slate-700" : "bg-blue-600 text-white"} ${msg.requires_clinician_action ? "ring-2 ring-amber-400" : ""}`}>
              {msg.message_type === "Voice_Note" && (
                <p className="flex items-center gap-1 opacity-70 text-xs">
                  <Mic className="w-3 h-3" /> Voice Note
                </p>
              )}
              {msg.message_type === "Image" && msg.image_url && (
                <a href={msg.image_url} target="_blank" rel="noreferrer">
                  <img src={msg.image_url} alt="dipstick" className="rounded-lg max-h-24 object-cover" />
                </a>
              )}
              {msg.message_text && <p>{msg.message_text}</p>}
              {msg.transcription && <p className="italic opacity-80">{msg.transcription}</p>}
              {hasData && (
                <div className={`text-xs rounded-lg px-2 py-1 mt-1 ${isOut ? "bg-white/60 text-slate-800" : "bg-blue-700 text-white/90"}`}>
                  📊 {de.protein_result && `Protein: ${de.protein_result}`}
                  {de.medication_taken != null && ` · Med: ${de.medication_taken ? "✓" : "✗"}`}
                  {de.weight_kg && ` · Wt: ${de.weight_kg}kg`}
                  {de.bp_systolic && ` · BP: ${de.bp_systolic}/${de.bp_diastolic}`}
                </div>
              )}
              {msg.requires_clinician_action && (
                <p className="text-amber-600 font-semibold text-xs">⚠ Review needed</p>
              )}
              <p className="opacity-50 text-xs">
                {msg.message_timestamp ? format(parseISO(msg.message_timestamp), "dd MMM HH:mm") : ""}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Pre-Clinic Summary Modal ────────────────────────────────────────────────
function PreClinicSummaryModal({ patient, onClose }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generate = async () => {
      const [logs, alerts, relapses, prescriptions, waMsgs] = await Promise.all([
        base44.entities.PatientDailyLog.filter({ patient_id: patient.id }, "-log_date", 90),
        base44.entities.MonitoringAlert.filter({ patient_id: patient.id }, "-generated_at", 50),
        base44.entities.NSRelapseEpisode.filter({ patient_id: patient.id }, "-relapse_onset_date", 1),
        base44.entities.Prescription.filter({ patient_id: patient.id }, "-prescription_date", 1),
        base44.entities.WhatsAppMessageLog.filter({ patient_id: patient.id }, "-message_timestamp", 20),
      ]);

      const last30 = format(subDays(new Date(), 30), "yyyy-MM-dd");
      const recentLogs = logs.filter(l => l.log_date >= last30);
      const proteinLogs = recentLogs.filter(l => l.module_type === "Urine_Protein");
      const medLogs = recentLogs.filter(l => l.module_type === "Medications");
      const bpLogs = recentLogs.filter(l => l.module_type === "Blood_Pressure");
      const wLogs = recentLogs.filter(l => l.module_type === "Weight");

      // Protein stats
      const pCounts = { Negative: 0, Trace: 0, "1+": 0, "2+": 0, "3+": 0, "4+": 0 };
      proteinLogs.forEach(l => { if (pCounts[l.protein_result] != null) pCounts[l.protein_result]++; });
      const positives = ["2+", "3+", "4+"];
      let streak = 0;
      let maxStreak = 0;
      [...proteinLogs].sort((a, b) => b.log_date.localeCompare(a.log_date)).forEach(l => {
        if (positives.includes(l.protein_result)) streak++;
        else streak = 0;
        maxStreak = Math.max(maxStreak, streak);
      });
      const lastProtein = proteinLogs.sort((a, b) => b.log_date.localeCompare(a.log_date))[0];

      // Meds
      const taken = medLogs.filter(l => l.value?.taken === true).length;
      const medPct = medLogs.length > 0 ? Math.round((taken / medLogs.length) * 100) : null;
      const lastMissed = medLogs.filter(l => l.value?.taken === false).sort((a, b) => b.log_date.localeCompare(a.log_date))[0];

      // BP
      const sysList = bpLogs.map(l => l.bp_systolic).filter(Boolean);
      const lastBP = bpLogs.sort((a, b) => b.log_date.localeCompare(a.log_date))[0];

      // Weight
      const sortedW = wLogs.sort((a, b) => b.log_date.localeCompare(a.log_date));
      const weightChange = sortedW.length >= 2
        ? +(sortedW[0].weight_kg - sortedW[sortedW.length - 1].weight_kg).toFixed(1)
        : null;

      // Alerts
      const recentAlerts = alerts.filter(a => a.generated_at >= new Date(last30).toISOString());
      const relapse = relapses[0];
      const rx = prescriptions[0];
      const meds = rx?.medications?.map(m => `${m.drug_name || m.generic_name} ${m.dose}${m.unit || ""} ${m.frequency}`).join(", ") || "See prescription";

      const txt = [
        `Pre-Clinic Summary — ${patient.patient_name} (CR: ${patient.cr_number})`,
        `Generated: ${format(new Date(), "dd MMM yyyy HH:mm")} | Source: KidneyCare WhatsApp Agent`,
        ``,
        `URINE PROTEIN — Last 30 days:`,
        `  Negative: ${pCounts.Negative}  Trace: ${pCounts.Trace}  1+: ${pCounts["1+"]}  2+: ${pCounts["2+"]}  3+/4+: ${pCounts["3+"] + pCounts["4+"]}`,
        `  Longest positive streak: ${maxStreak} day${maxStreak !== 1 ? "s" : ""}`,
        lastProtein ? `  Last reading: ${lastProtein.protein_result} on ${lastProtein.log_date} (AI confidence: ${lastProtein.confidence_score ? lastProtein.confidence_score + "%" : "N/A"})` : `  No protein data`,
        ``,
        `MEDICATION COMPLIANCE:`,
        medPct != null ? `  ${medPct}% (${taken}/${medLogs.length} days logged)` : `  No medication data`,
        lastMissed ? `  Last missed dose: ${lastMissed.log_date}` : `  No missed doses recorded`,
        ``,
        `BLOOD PRESSURE (last ${bpLogs.length} readings):`,
        sysList.length > 0 ? `  Range: ${Math.min(...sysList)}–${Math.max(...sysList)} mmHg systolic` : `  No BP data`,
        lastBP ? `  Most recent: ${lastBP.bp_systolic}/${lastBP.bp_diastolic} on ${lastBP.log_date}` : "",
        ``,
        `WEIGHT TREND:`,
        sortedW[0] ? `  Last: ${sortedW[0].weight_kg} kg on ${sortedW[0].log_date}` : `  No weight data`,
        weightChange != null ? `  Change vs 30 days ago: ${weightChange > 0 ? "+" : ""}${weightChange} kg` : "",
        ``,
        `ALERTS — Last 30 days:`,
        `  ${recentAlerts.length} alert(s) triggered`,
        ...recentAlerts.slice(0, 5).map(a => `  • [${a.priority}] ${a.message?.substring(0, 100)}`),
        ``,
        relapse ? `LAST RELAPSE: ${relapse.relapse_onset_date} — ${relapse.outcome || "Ongoing"}` : "LAST RELAPSE: No relapse episodes recorded",
        `CURRENT MEDICATIONS: ${meds}`,
        ``,
        `WhatsApp monitoring data via KidneyCare AI · AIIMS Patna`,
      ].filter(l => l !== undefined).join("\n");

      setSummary(txt);
      setLoading(false);
    };
    generate();
  }, [patient]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-bold text-sm text-slate-800">Pre-Clinic Summary</h3>
          <div className="flex gap-2">
            {summary && (
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => {
                navigator.clipboard.writeText(summary);
                toast.success("Copied to clipboard");
              }}>
                <Copy className="w-3 h-3 mr-1" /> Copy
              </Button>
            )}
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-5 h-5 animate-spin text-blue-500 mr-2" />
              <span className="text-sm text-slate-500">Generating summary…</span>
            </div>
          ) : (
            <pre className="text-xs text-slate-800 font-mono whitespace-pre-wrap leading-relaxed bg-slate-50 rounded-xl p-4">{summary}</pre>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────
export default function HomeMonitoringTab({ patient }) {
  const [activeView, setActiveView] = useState("charts");
  const [showSummary, setShowSummary] = useState(false);
  const queryClient = useQueryClient();

  const since30 = format(subDays(new Date(), 30), "yyyy-MM-dd");

  const { data: logs = [], isLoading: logsLoading } = useQuery({
    queryKey: ["patient-daily-logs", patient.id],
    queryFn: () => base44.entities.PatientDailyLog.filter({ patient_id: patient.id }, "-log_date", 90),
  });

  const { data: aiResults = [] } = useQuery({
    queryKey: ["patient-ai-results", patient.id],
    queryFn: () => base44.entities.KidneyCareAIResult.filter({ patient_id: patient.id }, "-capture_timestamp", 30),
  });

  const openRelapse = async (alert) => {
    const user = await base44.auth.me();
    await base44.entities.NSRelapseEpisode.create({
      patient_id: alert.patient_id,
      relapse_onset_date: format(new Date(), "yyyy-MM-dd"),
      dipstick_at_relapse: "2+",
      recorded_by: user.email,
      outcome: "Ongoing",
    });
    queryClient.invalidateQueries({ queryKey: ["patient-alerts", patient.id] });
    toast.success("Relapse episode opened");
  };

  const recentLogs = logs.filter(l => l.log_date >= since30);

  return (
    <div className="space-y-4 pb-6">
      {/* Top action */}
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-600" /> Home Monitoring / घर निगरानी
        </h3>
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setShowSummary(true)}>
          <ClipboardList className="w-3 h-3 mr-1" /> Pre-Clinic Summary
        </Button>
      </div>

      {/* Alert Banner */}
      <AlertBanner patientId={patient.id} onOpenRelapse={openRelapse} />

      {/* Tab toggle */}
      <div className="flex gap-1 border-b border-slate-200">
        {[
          { id: "charts", label: "📊 Trends" },
          { id: "wa", label: "💬 WhatsApp Thread" },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveView(t.id)}
            className={`px-3 py-1.5 text-xs font-semibold border-b-2 transition-colors ${activeView === t.id ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {activeView === "charts" && (
        <div className="space-y-4">
          {logsLoading ? (
            <div className="py-8 text-center"><Loader2 className="w-5 h-5 animate-spin text-slate-400 mx-auto" /></div>
          ) : (
            <>
              <Card>
                <CardContent className="pt-4">
                  <ProteinChart logs={recentLogs} aiResults={aiResults} />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <BPChart logs={recentLogs} patientDob={patient.date_of_birth} />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <MedCalendar logs={recentLogs} />
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {activeView === "wa" && (
        <Card>
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Conversation Thread
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <WAThread patientId={patient.id} />
          </CardContent>
        </Card>
      )}

      {showSummary && <PreClinicSummaryModal patient={patient} onClose={() => setShowSummary(false)} />}
    </div>
  );
}