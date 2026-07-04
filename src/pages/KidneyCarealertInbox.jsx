import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import {
  AlertTriangle, CheckCircle, Bell, Search, RefreshCw,
  User, ExternalLink, Loader2, ClipboardList
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

const PRIORITY_CONFIG = {
  Critical: { color: "border-red-500 bg-red-50", badge: "bg-red-100 text-red-800", icon: "🔴", label: "CRITICAL" },
  High: { color: "border-orange-400 bg-orange-50", badge: "bg-orange-100 text-orange-800", icon: "⚠", label: "HIGH" },
  Medium: { color: "border-yellow-400 bg-yellow-50", badge: "bg-yellow-100 text-yellow-800", icon: "🟡", label: "MEDIUM" },
};

function AlertCard({ alert, onAcknowledge, onOpenRelapse, onViewPatient }) {
  const cfg = PRIORITY_CONFIG[alert.priority] || PRIORITY_CONFIG.Medium;
  return (
    <div className={`border-2 rounded-xl p-3 ${cfg.color} space-y-2`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm">{cfg.icon}</span>
            <Badge className={`text-xs border-0 ${cfg.badge}`}>{cfg.label}</Badge>
            <Badge variant="outline" className="text-xs">{alert.alert_type?.replace(/_/g, " ")}</Badge>
          </div>
          <p className="text-sm font-bold text-slate-800">{alert.patient_name || "Unknown Patient"}</p>
          <p className="text-xs text-slate-500 mb-1">
            {alert.generated_at ? format(new Date(alert.generated_at), "dd MMM yyyy HH:mm") : "—"}
          </p>
          <p className="text-xs text-slate-700 leading-relaxed">{alert.message}</p>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onViewPatient(alert)}>
          <User className="w-3 h-3 mr-1" /> View Patient
        </Button>
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onAcknowledge(alert.id)}>
          <CheckCircle className="w-3 h-3 mr-1" /> Acknowledge
        </Button>
        {alert.alert_type === "Relapse_Suspected" && (
          <Button size="sm" className="h-7 text-xs bg-red-600 hover:bg-red-700 text-white" onClick={() => onOpenRelapse(alert)}>
            <ClipboardList className="w-3 h-3 mr-1" /> Open Relapse Episode
          </Button>
        )}
      </div>
    </div>
  );
}

function UnmatchedCard({ record, onAssign }) {
  const [crInput, setCrInput] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [showInput, setShowInput] = useState(false);

  const handleAssign = async () => {
    if (!crInput.trim()) return;
    setAssigning(true);
    await base44.entities.KidneyCareInboundQueue.update(record.id, {
      raw_cr_number: crInput.trim(),
      match_status: "Pending",
      processed: false,
    });
    onAssign(record.id, crInput.trim());
    setAssigning(false);
    setShowInput(false);
  };

  return (
    <div className="border-2 border-slate-300 bg-slate-50 rounded-xl p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-slate-700">CR: {record.raw_cr_number || "—"}</p>
          <p className="text-xs text-slate-500">
            Received: {record.received_at ? format(new Date(record.received_at), "dd MMM yyyy HH:mm") : "—"}
          </p>
        </div>
        <Badge className="text-xs bg-slate-200 text-slate-700 border-0">{record.match_status}</Badge>
      </div>
      <div className="flex gap-3 text-xs text-slate-600 flex-wrap">
        {record.predicted_result && <span>Dipstick: <b>{record.predicted_result}</b></span>}
        {record.confidence_score && <span>Conf: <b>{record.confidence_score}%</b></span>}
        {record.prednisolone_dose_mg != null && <span>Pred: <b>{record.prednisolone_dose_mg}mg taken</b></span>}
      </div>
      {!showInput ? (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setShowInput(true)}>
            Assign CR
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs text-red-600" onClick={async () => {
            await base44.entities.KidneyCareInboundQueue.update(record.id, { match_status: "Discarded" });
            onAssign(record.id, null);
          }}>
            Discard
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input value={crInput} onChange={e => setCrInput(e.target.value)}
            placeholder="Enter correct CR number" className="h-7 text-xs flex-1" />
          <Button size="sm" className="h-7 text-xs bg-blue-600 hover:bg-blue-700" onClick={handleAssign} disabled={assigning}>
            {assigning ? <Loader2 className="w-3 h-3 animate-spin" /> : "Assign"}
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowInput(false)}>✕</Button>
        </div>
      )}
    </div>
  );
}

export default function KidneyCareAlertInbox() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState("alerts");

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["all-monitoring-alerts-unacked"],
    queryFn: () => base44.entities.MonitoringAlert.filter({ acknowledged: false }, "-generated_at", 100),
    refetchInterval: 30000,
  });

  const { data: unmatchedQueue = [] } = useQuery({
    queryKey: ["unmatched-queue"],
    queryFn: () => base44.entities.KidneyCareInboundQueue.filter({}),
    select: (data) => data.filter(r => ["Unmatched", "Error"].includes(r.match_status)),
  });

  const criticals = alerts.filter(a => a.priority === "Critical");
  const highs = alerts.filter(a => a.priority === "High");
  const mediums = alerts.filter(a => a.priority === "Medium");

  const acknowledgeAlert = async (alertId) => {
    const user = await base44.auth.me();
    await base44.entities.MonitoringAlert.update(alertId, {
      acknowledged: true,
      acknowledged_by: user.email,
      acknowledged_at: new Date().toISOString(),
    });
    toast.success("Alert acknowledged");
    queryClient.invalidateQueries({ queryKey: ["all-monitoring-alerts-unacked"] });
  };

  const openRelapseEpisode = async (alert) => {
    const user = await base44.auth.me();
    await base44.entities.NSRelapseEpisode.create({
      patient_id: alert.patient_id,
      relapse_onset_date: format(new Date(), "yyyy-MM-dd"),
      dipstick_at_relapse: "2+",
      recorded_by: user.email,
      outcome: "Ongoing",
    });
    await acknowledgeAlert(alert.id);
    toast.success("Relapse episode created");
  };

  const viewPatient = async (alert) => {
    if (!alert.patient_id) return;
    const patients = await base44.entities.Patient.filter({ id: alert.patient_id });
    if (patients.length > 0) {
      navigate(createPageUrl("PatientCockpit"), { state: { patient: patients[0], tab: "monitoring" } });
    }
  };

  const handleUnmatchedAssign = (recordId, crNumber) => {
    queryClient.invalidateQueries({ queryKey: ["unmatched-queue"] });
    if (crNumber) toast.success(`Queued for re-matching with CR: ${crNumber}`);
    else toast.success("Record discarded");
  };

  const priorityGroups = [
    { label: "Critical", items: criticals, cfg: PRIORITY_CONFIG.Critical },
    { label: "High", items: highs, cfg: PRIORITY_CONFIG.High },
    { label: "Medium", items: mediums, cfg: PRIORITY_CONFIG.Medium },
  ].filter(g => g.items.length > 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-5 h-5 text-red-600" />
          <h1 className="font-bold text-slate-900">Alert Inbox</h1>
          {alerts.length > 0 && (
            <span className="ml-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {alerts.length > 9 ? "9+" : alerts.length}
            </span>
          )}
          <Button size="sm" variant="ghost" className="ml-auto" onClick={() => {
            queryClient.invalidateQueries({ queryKey: ["all-monitoring-alerts-unacked"] });
            queryClient.invalidateQueries({ queryKey: ["unmatched-queue"] });
          }}>
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
        <div className="flex gap-1 border-b border-slate-100">
          {[
            { id: "alerts", label: `Alerts (${alerts.length})` },
            { id: "unmatched", label: `Unmatched (${unmatchedQueue.length})` },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveSubTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold border-b-2 transition-colors ${activeSubTab === tab.id ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500"}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        {activeSubTab === "alerts" && (
          isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
              <p className="text-slate-500 font-semibold">All clear — no unacknowledged alerts</p>
            </div>
          ) : priorityGroups.map(({ label, items, cfg }) => (
            <div key={label}>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                {cfg.icon} {label.toUpperCase()} ({items.length})
              </p>
              <div className="space-y-2">
                {items.map(alert => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onAcknowledge={acknowledgeAlert}
                    onOpenRelapse={openRelapseEpisode}
                    onViewPatient={viewPatient}
                  />
                ))}
              </div>
            </div>
          ))
        )}

        {activeSubTab === "unmatched" && (
          unmatchedQueue.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
              <p className="text-slate-500 font-semibold">No unmatched records</p>
            </div>
          ) : (
            <div className="space-y-2">
              {unmatchedQueue.map(record => (
                <UnmatchedCard key={record.id} record={record} onAssign={handleUnmatchedAssign} />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}