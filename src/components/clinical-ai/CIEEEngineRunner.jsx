/**
 * CIEEEngineRunner — the PathwayExecutionEngine (Component 4).
 *
 * A single, generic execution engine that traverses ANY CIEE decision graph
 * one node at a time — whether hand-authored (SRNS_PATHWAY) or generated from
 * an uploaded guideline by the DecisionNode Processor. It evaluates each node's
 * branch conditions against clinician input + the patient context vector,
 * intercepts prescription nodes with the PrescriptionSuppressor (Component 6),
 * accumulates the MonitoringRuleGenerator schedule (Component 5), and shows
 * node-level evidence via the TraceabilityLinker (Component 7).
 */
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FlaskConical, ShieldCheck, ShieldAlert, Activity, BookOpen,
  ArrowRight, ChevronRight, CheckCircle2,
} from "lucide-react";
import {
  checkPrescriptionSuppressor, generateMonitoringRules,
  isPrescriptionNode, nodeEvidence,
} from "@/lib/CIEEEngine";

const NODE_TYPE_META = {
  QUESTION: { label: 'Decision', card: 'border-blue-200', chip: 'bg-blue-100 text-blue-700', text: 'text-blue-600' },
  ASSESSMENT: { label: 'Assessment', card: 'border-amber-200', chip: 'bg-amber-100 text-amber-700', text: 'text-amber-600' },
  ACTION: { label: 'Action', card: 'border-green-200', chip: 'bg-green-100 text-green-700', text: 'text-green-600' },
  MONITORING: { label: 'Monitoring', card: 'border-purple-200', chip: 'bg-purple-100 text-purple-700', text: 'text-purple-600' },
  TERMINAL: { label: 'Complete', card: 'border-slate-300', chip: 'bg-slate-100 text-slate-700', text: 'text-slate-600' },
};

function EvidenceLine({ node, sources }) {
  const ev = nodeEvidence(node, sources);
  if (!ev) return null;
  return (
    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
      <ShieldCheck className="w-3 h-3 text-slate-400 flex-shrink-0" />
      {ev.grade && <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">Grade {ev.grade}</span>}
      <span className="text-[10px] text-slate-500">{ev.name}{ev.section ? ` §${ev.section}` : ''}</span>
      {ev.pmid && <span className="text-[9px] text-slate-400">PMID {ev.pmid}</span>}
    </div>
  );
}

// Monitoring rules emitted when a node executes: node-level rules first,
// otherwise fall back to the drug-based MonitoringRuleGenerator.
function rulesForNode(node, ctx) {
  if (Array.isArray(node.monitoring) && node.monitoring.length) {
    return node.monitoring.map((m, i) => ({
      rule_id: m.rule_id || `${node.id}-MR-${i + 1}`,
      monitoring_parameter: m.parameter,
      frequency: m.frequency,
      target_value: m.target,
      alert_condition: m.alert,
      alert_action: m.alert_action,
    }));
  }
  if (node.prescribes) return generateMonitoringRules([node.prescribes], ctx);
  return [];
}

export default function CIEEEngineRunner({
  pathway, sources, initialCtx = {}, recommend, onReset,
  title = 'CIEE Pathway Engine', subtitle,
}) {
  const [nodeId, setNodeId] = useState(pathway.entry);
  const [ctx, setCtx] = useState(initialCtx);
  const [history, setHistory] = useState([]);
  const [monitoring, setMonitoring] = useState([]);
  const [suppressions, setSuppressions] = useState([]);

  const node = pathway.nodes[nodeId];
  if (!node) return <div className="text-xs text-red-600">Pathway error: node "{nodeId}" not found.</div>;

  const meta = NODE_TYPE_META[node.type] || NODE_TYPE_META.ACTION;
  const supp = isPrescriptionNode(node) ? checkPrescriptionSuppressor(node.prescribes, ctx) : { suppressed: false };

  // where a suppressed prescription redirects: prefer an ACE-I/supportive node, else just continue
  const suppressRedirect = () => {
    const ids = Object.keys(pathway.nodes);
    const aceNode = ids.find(id => /ace|supportive|enalapril|ramipril|losartan/i.test(pathway.nodes[id].action || ''));
    return aceNode || node.next;
  };

  const restart = () => {
    setNodeId(pathway.entry); setCtx(initialCtx);
    setHistory([]); setMonitoring([]); setSuppressions([]);
  };

  const choose = (opt) => {
    const newCtx = { ...ctx, ...(opt.set || {}) };
    setCtx(newCtx);
    setHistory(h => [...h, { node, choiceLabel: opt.label }]);
    setNodeId(opt.next);
  };

  const advance = () => {
    if (isPrescriptionNode(node) && supp.suppressed) {
      setSuppressions(s => [...s, supp.suppression_event]);
      setHistory(h => [...h, { node, suppressed: true, reason: supp.reason }]);
      setNodeId(suppressRedirect());
      return;
    }
    const rules = rulesForNode(node, ctx);
    if (rules.length) {
      setMonitoring(m => {
        const merged = [...m, ...rules];
        return [...new Map(merged.map(r => [r.rule_id, r])).values()];
      });
    }
    setHistory(h => [...h, { node }]);
    setNodeId(node.next);
  };

  const isQuestion = node.type === 'QUESTION' || node.type === 'ASSESSMENT';
  const isTerminal = node.type === 'TERMINAL';
  const recIdx = isQuestion && recommend ? recommend(node, ctx) : -1;
  const stepNo = history.length + 1;

  return (
    <div className="space-y-3">
      {/* engine header */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-indigo-700" />
          <div>
            <p className="text-sm font-bold text-indigo-800">{title}</p>
            {subtitle && <p className="text-[10px] text-indigo-600">{subtitle}</p>}
          </div>
        </div>
        <Badge className={isTerminal ? 'bg-green-600' : 'bg-indigo-600'}>
          {isTerminal ? 'Complete' : `Step ${stepNo}`}
        </Badge>
      </div>

      {/* decision trail */}
      {history.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          {history.map((h, i) => (
            <React.Fragment key={i}>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${h.suppressed ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-slate-200 text-slate-600'}`}>
                <span className="font-bold">{h.node.id}</span>{h.choiceLabel ? ` · ${h.choiceLabel}` : h.suppressed ? ' · blocked' : ''}
              </span>
              <ChevronRight className="w-3 h-3 text-slate-300" />
            </React.Fragment>
          ))}
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-600 text-white font-bold">{node.id}</span>
        </div>
      )}

      {/* current node */}
      {!isTerminal && (
        <Card className={`border-2 ${meta.card}`}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-bold ${meta.chip} px-1.5 py-0.5 rounded`}>{node.id}</span>
              <span className={`text-[10px] font-bold uppercase tracking-wide ${meta.text}`}>{meta.label}</span>
              {node.critical && <Badge variant="outline" className="text-[8px] py-0 border-rose-300 text-rose-600">critical branch</Badge>}
            </div>

            <p className="text-sm font-semibold text-slate-800">{node.question || node.action}</p>
            {node.detail && <p className="text-xs text-slate-500">{node.detail}</p>}

            {isPrescriptionNode(node) && supp.suppressed && (
              <div className="bg-red-50 border-2 border-red-400 rounded-lg px-3 py-2.5 flex items-start gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-red-800">PrescriptionSuppressor — BLOCKED</p>
                  <p className="text-[11px] text-red-700 mt-0.5">{supp.reason}</p>
                </div>
              </div>
            )}

            {isQuestion && (
              <div className="space-y-2 pt-1">
                {(node.options || []).map((opt, i) => (
                  <button key={i} onClick={() => choose(opt)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg border-2 transition-all flex items-center justify-between gap-2
                      ${opt.tone === 'danger' ? 'border-rose-200 hover:border-rose-400 hover:bg-rose-50'
                        : opt.tone === 'muted' ? 'border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                        : 'border-blue-200 hover:border-blue-400 hover:bg-blue-50'}
                      ${i === recIdx ? 'ring-2 ring-indigo-300 bg-indigo-50/40' : ''}`}>
                    <span className="text-sm font-medium text-slate-700">{opt.label}</span>
                    <span className="flex items-center gap-1 flex-shrink-0">
                      {i === recIdx && <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.5 rounded-full font-bold">context</span>}
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </span>
                  </button>
                ))}
              </div>
            )}

            {!isQuestion && (
              <Button onClick={advance} className={`w-full ${supp.suppressed ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white text-sm h-9`}>
                {supp.suppressed ? 'Continue → supportive pathway' : 'Continue'}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}

            <EvidenceLine node={node} sources={sources} />
          </CardContent>
        </Card>
      )}

      {/* terminal summary */}
      {isTerminal && (
        <div className="space-y-3">
          <Card className="border-2 border-green-200 bg-green-50/40">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <p className="text-sm font-bold text-green-800">Pathway Complete</p>
              </div>
              <p className="text-xs text-slate-600">{node.action}</p>
              <EvidenceLine node={node} sources={sources} />
            </CardContent>
          </Card>

          <div className="bg-white border border-slate-200 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs font-bold text-slate-700">Executed Pathway</span>
              <Badge variant="outline" className="text-[9px] py-0">TraceabilityLinker</Badge>
            </div>
            <div className="space-y-1.5">
              {history.map((h, i) => {
                const ev = nodeEvidence(h.node, sources);
                return (
                  <div key={i} className={`text-[11px] border-l-2 pl-2 ${h.suppressed ? 'border-red-400' : 'border-indigo-300'}`}>
                    <span className="font-semibold text-slate-700">{h.node.id}</span>
                    <span className="text-slate-600"> · {h.suppressed ? `[SUPPRESSED] ${h.node.action}` : (h.choiceLabel || h.node.action)}</span>
                    {ev?.grade && <span className="text-[9px] text-slate-400 ml-1">(Grade {ev.grade})</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {suppressions.length > 0 && (
            <div className="bg-red-50 border-2 border-red-300 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                <span className="text-xs font-bold text-red-800">PrescriptionSuppressor Log</span>
              </div>
              {suppressions.map((ev, i) => (
                <p key={i} className="text-[11px] text-red-700">
                  {ev.drug} blocked — {ev.acmg_class} variant{ev.gene ? ` in ${ev.gene}` : ''} · {ev.rule_id} · {new Date(ev.ts).toLocaleString()}
                </p>
              ))}
            </div>
          )}

          {monitoring.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Activity className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs font-bold text-slate-700">Generated Monitoring Schedule</span>
                <Badge variant="outline" className="text-[9px] py-0">MonitoringRuleGenerator</Badge>
              </div>
              <div className="space-y-1.5">
                {monitoring.map((r, i) => (
                  <div key={i} className="bg-white rounded p-2 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-800">{r.monitoring_parameter}</span>
                      <span className="text-[10px] text-slate-500">{r.frequency}</span>
                    </div>
                    {r.target_value && <p className="text-[10px] text-slate-600">Target: {r.target_value}</p>}
                    {r.alert_condition && <p className="text-[9px] text-red-600">⚠ {r.alert_condition}{r.alert_action ? ` → ${r.alert_action}` : ''}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button variant="outline" size="sm" className="w-full" onClick={onReset || restart}>
            Run Again
          </Button>
        </div>
      )}

      {!isTerminal && (
        <button onClick={restart} className="w-full text-[11px] text-slate-400 underline text-center">
          Restart pathway
        </button>
      )}
    </div>
  );
}
