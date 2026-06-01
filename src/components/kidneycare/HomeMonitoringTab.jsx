import React, { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, subDays, differenceInDays } from "date-fns";
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";
import {
  AlertTriangle, CheckCircle, Bell, MessageSquare, Copy,
  ChevronRight, Loader2, Image as ImageIcon, Mic, FileText
} from "lucide-react";
import { toast } from "sonner";

const PROTEIN_NUM = { "Negative": 0, "Trace": 0.5, "1+": 1, "2+": 2, "3+": 3, "4+": 4 };
const NUM_PROTEIN = { 0: "Neg", 0.5: "Trace", 1: "1+", 2: "2+", 3: "3+", 4: "4+" };
const PROTEIN_COLOR = (v) => v <= 0.5 ? "#22c55e" : v === 1 ? "#eab308" : v === 2 ? "#f97316" : "#ef4444";

function AlertBanner({ alerts, patientId, onAcknowledge, onOpenRelapse }) {
  const criticals = alerts.filter(a => a.priority === "Critical");
  const highs = alerts.filter(a => a.priority === "High");
  const mediums = alerts.filter(a => a.priority === "Medium");

  if (alerts.length === 0) return null;

  const color = criticals.length > 0
    ? "border-red-500 bg-red-50"
    : highs.length > 0
    ? "border-orange-400 bg-orange-50"
    : "border-yellow-400 bg-yellow-50";
  const textColor = criticals.length > 0 ? "text-red-800" : highs.length > 0 ? "text-orange-800" : "text-yellow-800";

  return (
    <div className={`rounded-xl border-2 p-3 ${color} space-y-2`}>
      <div className={`flex items-center gap-2 font-bold text-sm ${textColor}`}>
        {criticals.length > 0 ? (
          <>
            <span className="animate-pulse">🚨</span>
            {criticals.length} Critical Alert{criticals.length > 1 ? "s" : ""} — action required
          </>
        ) : (
          <>
            <AlertTriangle className="w-4 h-4" />
            {alerts.length} Active Alert{alerts.length > 1 ? "s" : ""}
          </>
        )}
      </div>
      {alerts.slice(0, 3).map(alert => (
        <div key={alert.id} className={`bg-white/70 rounded-lg p-2.5 text-xs ${textColor}`}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <Badge className={`text-xs mb-1 border-0 ${
                alert.priority === "Critical" ? "bg-red-100 text-red-800" :
                alert.priority === "High" ? "bg-orange-100 text-orange-800" :
                "bg-yellow-100 text-yellow-800"
              }`}>{alert.priority}</Badge>
              <p className="leading-relaxed">{alert.message}</p>
              <p className="text-slate-400 mt-1">{alert.generated_at ? format(new Date(alert.generated_at), "dd MMM HH:mm") : "—"}</p>
            </div>
          </div>
          <div className="flex gap-2 mt-2 flex-wrap">
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onAcknowledge(alert.id)}>
              Acknowledge
            </Button>
            {alert.alert_type === "Relapse_Suspected" && (
              <Button size="sm" className="h-7 text-xs bg-red-600 hover:bg-red-700 text-white" onClick={() => onOpenRelapse(alert)}>
                Open Relapse Episode
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProteinHeatmap({ logs30d }) {
  const today = new Date();
  return (
    <div className="flex gap-0.5 flex-wrap mt-2">
      {Array.from({ length: 30 }, (_, i) => {
        const date = format(subDays(today, 29 - i), "yyyy-MM-dd");
        const log = logs30d.find(l => l.log_date === date && l.module_type === "Urine_Protein");
        const val = log ? (PROTEIN_NUM[log.protein_result] ?? -1) : -1;
        const color = val === -1 ? "#e2e8f0" : PROTEIN_COLOR(val);
        return (
          <div key={date} title={`${date}: ${log?.protein_result || "No data"}`}
            style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: color }} />
        );
      })}
    </div>
  );
}

function ComplianceGrid({ medLogs30d }) {
  const today = new Date();
  let taken = 0;
  const squares = Array.from({ length: 30 }, (_, i) => {
    const date = format(subDays(today, 29 - i), "yyyy-MM-dd");
    const log = medLogs30d.find(l => l.log_date === date);
    if (!log) return { date, color: "#e2e8f0", status: "no-data" };
    const wasTaken = log.value?.taken === true;
    if (wasTaken) taken++;
    return { date, color: wasTaken ? "#22c55e" : "#ef4444", status: wasTaken ? "taken" : "missed" };
  });
  const logged = squares.filter(s => s.status !== "no-data").length;
  const pct = logged > 0 ? Math.round((taken / logged) * 100) : 0;
  return (
    <div>
      <div className="flex gap-0.5 flex-wrap">
        {squares.map(sq => (
          <div key={sq.date} title={`${sq.date}: ${sq.status}`}
            style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: sq.color }} />
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-1">{taken}/{logged} days logged — {pct}% compliance</p>
    </div>
  );
}

function WhatsAppThread({ messages }) {
  const [expandedImg, setExpandedImg] = useState(null);
  if (messages.length === 0) {
    return <p className="text-xs text-slate-400 text-center py-4">No WhatsApp messages on record</p>;
  }
  return (
    <div className="space-y-2 max-h-80 overflow-y-auto">
      {messages.map(msg => {
        const isOutbound = msg.direction === "Outbound";
        return (
          <div key={msg.id} className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-xs ${msg.requires_clinician_action ? "ring-2 ring-amber-400 rounded-xl" : ""}`}>
              {msg.requires_clinician_action && (
                <p className="text-xs text-amber-700 font-semibold px-1 mb-0.5">⚠ Review needed</p>
              )}
              <div className={`rounded-xl px-3 py-2 text-xs ${
                isOutbound ? "bg-slate-200 text-slate-800" : "bg-blue-100 text-blue-900"
              }`}>
                {msg.message_type === "Image" && msg.image_url && (
                  <img src={msg.image_url} alt="dipstick" className="w-24 h-16 object-cover rounded mb-1 cursor-pointer"
                    onClick={() => setExpandedImg(msg.image_url)} />
                )}
                {msg.message_type === "Voice_Note" && (
                  <div className="flex items-center gap-1 mb-1 text-slate-500">
                    <Mic className="w-3 h-3" />
                    <span className="italic">{msg.transcription || "Voice note"}</span>
                  </div>
                )}
                {msg.message_text && <p>{msg.message_text}</p>}
                {msg.data_extracted && Object.values(msg.data_extracted).some(Boolean) && (
                  <div className="mt-1.5 bg-white/60 rounded px-2 py-1 text-xs text-slate-600">
                    📊 {msg.data_extracted.protein_result && `Protein: ${msg.data_extracted.protein_result}`}
                    {msg.data_extracted.medication_taken !== undefined && ` · Med: ${msg.data_extracted.medication_taken ? "✓" : "✗"}`}
                    {msg.data_extracted.weight_kg && ` · Wt: ${msg.data_extracted.weight_kg}kg`}
                  </div>
                )}
                <p className="text-slate-400 mt-1">{msg.message_timestamp ? format(new Date(msg.message_timestamp), "dd MMM HH:mm") : ""}</p>
              </div>
            </div>
          </div>
        );
      })}
      {expandedImg && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={() => setExpandedImg(null)}>
          <img src={expandedImg} alt="full" className="max-w-sm max-h-96 rounded-xl" />
        </div>
      )}
    </div>
  );
}

export default function HomeMonitoringTab({ patient }) {
  const queryClient = useQueryClient();
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const [generatingSummary, setGeneratingSummary] = useState(false);

  const thirtyDaysAgo = format(subDays(new Date(), 30), "yyyy-MM-dd");

  const { data: alerts = [] } = useQuery({
    queryKey: ["monitoring-alerts", patient.id],
    queryFn: () => base44.entities.MonitoringAlert.filter({ patient_id: patient.id, acknowledged: false }),
    enabled: !!patient.id,
    refetchInterval: 30000,
  });

  const { data: dailyLogs = [] } = useQuery({
    queryKey: ["daily-logs-30d", patient.id],
    queryFn: () => base44.entities.PatientDailyLog.filter({ patient_id: patient.id }, "-log_date", 100),
    enabled: !!patient.id,
  });

  const { data: aiResults = [] } = useQuery({
    queryKey: ["ai-results-30d", patient.id],
    queryFn: () => base44.entities.KidneyCareAIResult.filter({ patient_id: patient.id }, "-capture_timestamp", 50),
    enabled: !!patient.id,
  });

  const { data: waMessages = [] } = useQuery({
    queryKey: ["wa-messages", patient.id],
    queryFn: () => base44.entities.WhatsAppMessageLog.filter({ patient_id: patient.id }, "-message_timestamp", 50),
    enabled: !!patient.id,
  });

  const logs30d = dailyLogs.filter(l => l.log_date >= thirtyDaysAgo);
  const proteinLogs = logs30d.filter(l => l.module_type === "Urine_Protein");
  const bpLogs = logs30d.filter(l => l.module_type === "Blood_Pressure");
  const medLogs = logs30d.filter(l => l.module_type === "Medications");

  // Build chart data for protein
  const today = new Date();
  const proteinChartData = Array.from({ length: 30 }, (_, i) => {
    const date = format(subDays(today, 29 - i), "yyyy-MM-dd");
    const log = proteinLogs.find(l => l.log_date === date);
    const aiResult = aiResults.find(r => r.capture_timestamp?.startsWith(date));
    return {
      date: format(subDays(today, 29 - i), "dd/MM"),
      fullDate: date,
      value: log ? (PROTEIN_NUM[log.protein_result] ?? null) : null,
      label: log?.protein_result,
      confidence: aiResult ? Math.round((aiResult.confidence_score || 0) * 100) : null,
      source: log?.source === "AI" ? "WA" : "Lab",
    };
  }).filter(d => d.value !== null);

  const bpChartData = bpLogs.map(l => ({
    date: format(new Date(l.log_date), "dd/MM"),
    systolic: l.bp_systolic,
    diastolic: l.bp_diastolic,
    map: l.bp_systolic && l.bp_diastolic ? Math.round(l.bp_diastolic + (l.bp_systolic - l.bp_diastolic) / 3) : null,
  }));

  const acknowledgeAlert = useMutation({
    mutationFn: async (alertId) => {
      const user = await base44.auth.me();
      await base44.entities.MonitoringAlert.update(alertId, {
        acknowledged: true,
        acknowledged_by: user.email,
        acknowledged_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      toast.success("Alert acknowledged");
      queryClient.invalidateQueries({ queryKey: ["monitoring-alerts", patient.id] });
    },
  });

  const openRelapseEpisode = useMutation({
    mutationFn: async (alert) => {
      const user = await base44.auth.me();
      const firstPosLog = logs30d
        .filter(l => l.module_type === "Urine_Protein" && ["2+","3+","4+"].includes(l.protein_result))
        .sort((a, b) => a.log_date.localeCompare(b.log_date))[0];
      await base44.entities.NSRelapseEpisode.create({
        patient_id: patient.id,
        relapse_onset_date: firstPosLog?.log_date || format(new Date(), "yyyy-MM-dd"),
        dipstick_at_relapse: alert.threshold_value || "2+",
        recorded_by: user.email,
        outcome: "Ongoing",
      });
      await base44.entities.MonitoringAlert.update(alert.id, {
        acknowledged: true,
        acknowledged_by: user.email,
        acknowledged_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      toast.success("Relapse episode created");
      queryClient.invalidateQueries({ queryKey: ["monitoring-alerts", patient.id] });
    },
  });

  const generateSummary = useCallback(async () => {
    setGeneratingSummary(true);
    const now = new Date();
    // Protein stats
    const positiveProtein = proteinLogs.filter(l => ["2+","3+","4+"].includes(l.protein_result));
    const negLogs = proteinLogs.filter(l => l.protein_result === "Negative" || l.protein_result === "Trace");
    const onePlusLogs = proteinLogs.filter(l => l.protein_result === "1+");
    const twoPlusLogs = proteinLogs.filter(l => l.protein_result === "2+");
    const threePlusLogs = proteinLogs.filter(l => ["3+","4+"].includes(l.protein_result));
    const lastProtein = proteinLogs.sort((a, b) => b.log_date.localeCompare(a.log_date))[0];
    const lastAiResult = aiResults.sort((a, b) => (b.capture_timestamp || "").localeCompare(a.capture_timestamp || ""))[0];

    // Streak calc
    const sortedPos = proteinLogs.sort((a, b) => b.log_date.localeCompare(a.log_date));
    let streak = 0;
    for (const l of sortedPos) {
      if (["2+","3+","4+"].includes(l.protein_result)) streak++; else break;
    }

    // Med compliance
    const medTaken = medLogs.filter(l => l.value?.taken === true).length;
    const medLogged = medLogs.length;
    const medPct = medLogged > 0 ? Math.round((medTaken / medLogged) * 100) : null;
    const lastMissed = medLogs.filter(l => l.value?.taken === false).sort((a, b) => b.log_date.localeCompare(a.log_date))[0];

    // BP
    const sortedBp = bpLogs.sort((a, b) => b.log_date.localeCompare(a.log_date));
    const minSys = sortedBp.length ? Math.min(...sortedBp.map(l => l.bp_systolic || 999)) : null;
    const maxSys = sortedBp.length ? Math.max(...sortedBp.map(l => l.bp_systolic || 0)) : null;
    const lastBp = sortedBp[0];

    // Weight
    const weightLogs = logs30d.filter(l => l.module_type === "Weight").sort((a, b) => b.log_date.localeCompare(a.log_date));
    const lastWt = weightLogs[0];
    const firstWt = weightLogs[weightLogs.length - 1];
    const wtChange = lastWt && firstWt ? (lastWt.weight_kg - firstWt.weight_kg).toFixed(1) : null;

    // Alerts
    const alertsAll = await base44.entities.MonitoringAlert.filter({ patient_id: patient.id });
    const alerts30d = alertsAll.filter(a => a.generated_at >= thirtyDaysAgo);
    const relapseAlerts30d = alerts30d.filter(a => a.alert_type === "Relapse_Suspected");

    const text = `Pre-Clinic Summary — ${patient.patient_name} (CR: ${patient.cr_number || "—"})
Generated: ${format(now, "dd MMM yyyy HH:mm")} | Source: KidneyCare WhatsApp Agent

URINE PROTEIN — Last 30 days:
  ${negLogs.length} Negative/Trace  ${onePlusLogs.length} 1+  ${twoPlusLogs.length} 2+  ${threePlusLogs.length} 3+/4+
  Longest positive streak: ${streak} days
  Last reading: ${lastProtein?.protein_result || "—"} on ${lastProtein?.log_date || "—"} — AI confidence ${lastAiResult ? Math.round((lastAiResult.confidence_score || 0) * 100) : "—"}%

MEDICATION COMPLIANCE:
  ${medPct !== null ? `${medPct}% (${medTaken}/${medLogged} days logged)` : "No data"}
  Last missed dose: ${lastMissed?.log_date || "None recorded"}

BLOOD PRESSURE (last ${bpLogs.length} readings):
  Range: ${minSys !== null && minSys !== 999 ? minSys : "—"}–${maxSys || "—"} mmHg systolic
  Most recent: ${lastBp ? `${lastBp.bp_systolic}/${lastBp.bp_diastolic} on ${lastBp.log_date}` : "—"}

WEIGHT TREND:
  Last: ${lastWt ? `${lastWt.weight_kg} kg on ${lastWt.log_date}` : "—"}
  Change vs 30 days ago: ${wtChange !== null ? `${wtChange > 0 ? "+" : ""}${wtChange} kg` : "—"}

ALERTS — Last 30 days:
  ${relapseAlerts30d.length} relapse alert(s) triggered
  ${alerts30d.map(a => `  · [${a.priority}] ${a.message}`).join("\n") || "  None"}

WhatsApp monitoring data via KidneyCare AI · AIIMS Patna`;

    setSummaryText(text);
    setShowSummaryModal(true);
    setGeneratingSummary(false);
  }, [patient, proteinLogs, medLogs, bpLogs, logs30d, aiResults, thirtyDaysAgo]);

  // Determine last log date
  const lastLog = dailyLogs.sort((a, b) => b.log_date.localeCompare(a.log_date))[0];

  return (
    <div className="space-y-4 pb-4">
      {/* Generate Summary button */}
      <Button onClick={generateSummary} disabled={generatingSummary}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-sm">
        {generatingSummary ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
        Generate Pre-Clinic Summary
      </Button>

      {/* Alert Banner */}
      {alerts.length > 0 ? (
        <AlertBanner
          alerts={alerts}
          patientId={patient.id}
          onAcknowledge={(id) => acknowledgeAlert.mutate(id)}
          onOpenRelapse={(alert) => openRelapseEpisode.mutate(alert)}
        />
      ) : (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2 text-xs text-green-700 font-semibold">
          <CheckCircle className="w-4 h-4" />
          No active alerts — last log: {lastLog?.log_date || "none"}
        </div>
      )}

      {/* Protein Trend Chart */}
      <Card>
        <CardHeader className="pb-1 pt-3 px-3">
          <CardTitle className="text-sm">Urine Protein — 30 Days</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          {proteinChartData.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-3">No protein data</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={proteinChartData}>
                  <defs>
                    <linearGradient id="protGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} interval={4} />
                  <YAxis domain={[0, 4]} ticks={[0, 0.5, 1, 2, 3, 4]}
                    tickFormatter={(v) => NUM_PROTEIN[v] || v}
                    tick={{ fontSize: 9 }} tickLine={false} width={30} />
                  <Tooltip formatter={(v, n) => [NUM_PROTEIN[v] || v, "Protein"]} />
                  <ReferenceLine y={2} stroke="#ef4444" strokeDasharray="4 2" label={{ value: "Relapse", position: "right", fontSize: 9, fill: "#ef4444" }} />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="url(#protGrad)"
                    dot={(props) => {
                      const { cx, cy, payload } = props;
                      return <circle key={payload.fullDate} cx={cx} cy={cy} r={4} fill={PROTEIN_COLOR(payload.value)} stroke="white" strokeWidth={1} />;
                    }} />
                </AreaChart>
              </ResponsiveContainer>
              <ProteinHeatmap logs30d={logs30d} />
            </>
          )}
        </CardContent>
      </Card>

      {/* BP Chart */}
      {bpChartData.length > 0 && (
        <Card>
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-sm">Blood Pressure Trend</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <ResponsiveContainer width="100%" height={100}>
              <LineChart data={bpChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} />
                <YAxis domain={[50, 160]} tick={{ fontSize: 9 }} tickLine={false} width={25} />
                <Tooltip />
                <Line type="monotone" dataKey="systolic" stroke="#ef4444" dot={false} strokeWidth={2} name="Systolic" />
                <Line type="monotone" dataKey="diastolic" stroke="#14b8a6" dot={false} strokeWidth={2} name="Diastolic" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Medication Compliance */}
      <Card>
        <CardHeader className="pb-1 pt-3 px-3">
          <CardTitle className="text-sm">Medication Compliance — 30 Days</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <ComplianceGrid medLogs30d={medLogs} />
        </CardContent>
      </Card>

      {/* WhatsApp Thread */}
      <Card>
        <CardHeader className="pb-1 pt-3 px-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-green-600" />
            WhatsApp Conversation Thread
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <WhatsAppThread messages={waMessages} />
        </CardContent>
      </Card>

      {/* Summary Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-slate-800">Pre-Clinic Summary</h3>
              <Button size="sm" variant="ghost" onClick={() => setShowSummaryModal(false)}>✕</Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">{summaryText}</pre>
            </div>
            <div className="p-4 border-t">
              <Button className="w-full" onClick={() => {
                navigator.clipboard.writeText(summaryText);
                toast.success("Summary copied to clipboard");
              }}>
                <Copy className="w-4 h-4 mr-2" /> Copy to Clipboard
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}