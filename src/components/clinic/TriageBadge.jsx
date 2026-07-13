/**
 * Triage priority system — shared badge, ordering, and auto-flagging logic
 * for appointments and clinical encounters.
 */
import React from "react";
import { AlertTriangle } from "lucide-react";

export const TRIAGE_LEVELS = [
  { value: "Emergency", cls: "bg-red-600 text-white", dot: "bg-red-600" },
  { value: "Urgent", cls: "bg-orange-100 text-orange-800 border border-orange-300", dot: "bg-orange-500" },
  { value: "Semi-Urgent", cls: "bg-amber-100 text-amber-800 border border-amber-300", dot: "bg-amber-400" },
  { value: "Routine", cls: "bg-slate-100 text-slate-600", dot: "bg-slate-400" },
];

const RANK = { Emergency: 0, Urgent: 1, "Semi-Urgent": 2, Routine: 3 };
export const triageRank = (p) => RANK[p] ?? 3;

const URGENT_KEYWORDS = /breathless|dyspn|seizure|convuls|anuria|oliguria|shock|unrespons|altered sensorium|severe|chest pain|bleeding|hyperkalemia|anasarca|hypertensive/i;

/** Auto-flag severity from appointment type + chief complaint. */
export function autoTriage(appointmentType, chiefComplaint = "") {
  if (appointmentType === "Emergency") return "Emergency";
  if (URGENT_KEYWORDS.test(chiefComplaint)) return "Urgent";
  return "Routine";
}

export default function TriageBadge({ priority }) {
  const level = TRIAGE_LEVELS.find((t) => t.value === priority);
  if (!level) return null;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${level.cls}`}>
      {priority === "Emergency" && <AlertTriangle className="w-3 h-3" />}
      {priority}
    </span>
  );
}