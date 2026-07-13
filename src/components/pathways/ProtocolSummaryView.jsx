/**
 * ProtocolSummaryView — read-friendly overview of a CIEE treatment protocol.
 * Each step is a collapsible row, so users only expand what is relevant at
 * their current stage of the consultation.
 */
import React from "react";
import { Pill, FlaskConical, Activity, CheckCircle2 } from "lucide-react";
import { nodeEvidence } from "@/lib/CIEEEngine";

const TYPE_STYLES = {
  QUESTION: "bg-blue-100 text-blue-700",
  ASSESSMENT: "bg-cyan-100 text-cyan-700",
  ACTION: "bg-emerald-100 text-emerald-700",
  MONITORING: "bg-indigo-100 text-indigo-700",
  TERMINAL: "bg-slate-100 text-slate-600",
};

// Walk the decision graph breadth-first from the entry node to get a stable,
// clinically-ordered list of every step in the protocol.
function orderedNodes(pathway) {
  const seen = new Set();
  const out = [];
  const queue = [pathway.entry];
  while (queue.length) {
    const id = queue.shift();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const n = pathway.nodes[id];
    if (!n) continue;
    out.push(n);
    if (n.next) queue.push(n.next);
    (n.options || []).forEach((o) => queue.push(o.next));
  }
  return out;
}

export default function ProtocolSummaryView({ pathway, sources, currentNodeId, completedIds = [] }) {
  const nodes = orderedNodes(pathway);
  const done = new Set(completedIds);
  return (
    <div className="space-y-1.5">
      {nodes.map((n, i) => {
        const ev = nodeEvidence(n, sources);
        const isDone = done.has(n.id);
        const isCurrent = n.id === currentNodeId;
        return (
          <details key={n.id} className={`rounded-lg border overflow-hidden ${isCurrent ? "border-violet-300 bg-violet-50/60" : "border-slate-200 bg-white"}`}>
            <summary className="px-2.5 py-2 cursor-pointer flex items-center gap-2 min-w-0">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${isDone ? "bg-emerald-500 text-white" : isCurrent ? "bg-violet-600 text-white" : "bg-slate-200 text-slate-600"}`}>
                {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
              </span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${TYPE_STYLES[n.type] || TYPE_STYLES.ACTION}`}>{n.type}</span>
              <span className="text-[12px] text-slate-700 truncate">{n.question || n.action}</span>
            </summary>
            <div className="px-3 pb-2.5 space-y-1.5 border-t border-slate-100 pt-2">
              <p className="text-[12px] text-slate-800 leading-relaxed">{n.question || n.action}</p>
              {n.detail && <p className="text-[11px] text-slate-500 leading-relaxed">{n.detail}</p>}
              {n.rx && (
                <p className="text-[11px] text-emerald-800 flex items-start gap-1.5">
                  <Pill className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  <span><b>{n.rx.drug}</b>{n.rx.dose ? ` — ${n.rx.dose}` : ""}{n.rx.route ? ` (${n.rx.route})` : ""}</span>
                </p>
              )}
              {Array.isArray(n.investigations) && n.investigations.length > 0 && (
                <p className="text-[11px] text-blue-800 flex items-start gap-1.5">
                  <FlaskConical className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  <span>{n.investigations.map((iv) => iv.test).join(" · ")}</span>
                </p>
              )}
              {Array.isArray(n.monitoring) && n.monitoring.length > 0 && (
                <p className="text-[11px] text-indigo-800 flex items-start gap-1.5">
                  <Activity className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  <span>{n.monitoring.map((m) => `${m.parameter}${m.frequency ? ` (${m.frequency})` : ""}`).join(" · ")}</span>
                </p>
              )}
              {ev && <p className="text-[10px] text-slate-400">{ev.name}{ev.grade ? ` · Grade ${ev.grade}` : ""}</p>}
            </div>
          </details>
        );
      })}
    </div>
  );
}