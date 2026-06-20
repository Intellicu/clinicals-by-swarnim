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
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  FlaskConical, ShieldAlert, Activity, BookOpen, Flag, ChevronRight,
} from "lucide-react";
import {
  checkPrescriptionSuppressor, generateMonitoringRules,
  isPrescriptionNode, nodeEvidence,
} from "@/lib/CIEEEngine";

// Compact answer label for the collapsed timeline (e.g. "Yes — Pathogenic" → "Yes")
function shortAnswer(label) {
  if (!label) return "";
  let s = String(label).split(/\s+[—–-]\s+/)[0].split(/\s*\(/)[0].trim();
  if (s.length > 26) s = String(label).trim().slice(0, 26) + "…";
  return s;
}

function EvidenceLine({ node, sources }) {
  const ev = nodeEvidence(node, sources);
  if (!ev) return null;
  return (
    <div className="flex items-center gap-1.5 mt-3 flex-wrap">
      {ev.grade && <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">Grade {ev.grade}</span>}
      <span className="text-[10px] text-slate-400">{ev.name}{ev.section ? ` §${ev.section}` : ''}</span>
      {ev.pmid && <span className="text-[9px] text-slate-300">PMID {ev.pmid}</span>}
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

  return (
    <div className="space-y-3">
      {/* slim header */}
      <div className="flex items-center gap-2 px-1">
        <FlaskConical className="w-4 h-4 text-indigo-600 flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-800 truncate">{title}</p>
          {subtitle && <p className="text-[10px] text-slate-400 truncate">{subtitle}</p>}
        </div>
      </div>

      {/* timeline */}
      <div className="relative pl-7 pt-1">
        <div className="absolute left-[9px] top-2 bottom-2 w-px bg-slate-200" />

        {/* completed steps — collapsed one-liners */}
        {history.map((h, i) => {
          const ans = h.suppressed ? 'Blocked' : (h.choiceLabel ? shortAnswer(h.choiceLabel) : null);
          return (
            <div key={i} className="relative mb-2.5">
              <span className={`absolute -left-[22px] top-[5px] w-2.5 h-2.5 rounded-full ${h.suppressed ? 'bg-red-500' : 'bg-slate-400'}`} />
              <div className="flex items-baseline gap-1.5 min-w-0">
                <span className={`text-[13px] leading-snug truncate ${h.suppressed ? 'text-red-700' : 'text-slate-500'}`}>{h.node.question || h.node.action}</span>
                {ans && <span className={`text-[13px] font-bold leading-snug flex-shrink-0 ${h.suppressed ? 'text-red-700' : 'text-slate-700'}`}>{ans}</span>}
              </div>
            </div>
          );
        })}

        {/* current node — expanded */}
        {!isTerminal && (
          <div className="relative">
            <span className="absolute -left-[23px] top-1 w-3 h-3 rounded-sm bg-slate-800" />
            <p className="text-[17px] leading-snug font-medium text-slate-900">{node.question || node.action}</p>
            {node.detail && <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{node.detail}</p>}

            {isPrescriptionNode(node) && supp.suppressed && (
              <div className="mt-3 bg-red-50 border border-red-300 rounded-lg px-3 py-2.5 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-red-700 leading-relaxed"><span className="font-bold">Prescription blocked. </span>{supp.reason}</p>
              </div>
            )}

            {isQuestion && (
              <div className="flex flex-wrap gap-2 mt-4">
                {(node.options || []).map((opt, i) => (
                  <button key={i} onClick={() => choose(opt)}
                    className={`px-4 py-2.5 rounded-lg border text-[15px] text-left transition-all
                      ${opt.tone === 'danger' ? 'border-rose-300 text-rose-700 hover:bg-rose-50'
                        : opt.tone === 'muted' ? 'border-slate-200 text-slate-500 hover:bg-slate-50'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50'}
                      ${i === recIdx ? 'ring-2 ring-indigo-300' : ''}`}>
                    {opt.label}
                    {i === recIdx && <span className="ml-1.5 text-[9px] bg-indigo-600 text-white px-1.5 py-0.5 rounded-full align-middle">context</span>}
                  </button>
                ))}
              </div>
            )}

            {!isQuestion && (
              <Button onClick={advance} className={`mt-4 ${supp.suppressed ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white text-sm h-9 px-5`}>
                {supp.suppressed ? 'Continue → supportive pathway' : 'Continue'}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}

            <EvidenceLine node={node} sources={sources} />
          </div>
        )}

        {/* terminal — flag + conclusion */}
        {isTerminal && (
          <div className="relative">
            <span className="absolute -left-[26px] top-0 text-slate-700"><Flag className="w-4 h-4" /></span>
            <p className="text-[17px] leading-snug text-slate-900">{node.action}</p>
            <EvidenceLine node={node} sources={sources} />
          </div>
        )}
      </div>

      {/* terminal — CIEE detail (collapsible, kept subtle) */}
      {isTerminal && (
        <details className="bg-white border border-slate-200 rounded-xl">
          <summary className="px-3 py-2 text-xs font-semibold text-slate-600 cursor-pointer flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" /> Evidence, monitoring & audit trail
          </summary>
          <div className="p-3 pt-0 space-y-3">
            {/* executed pathway */}
            <div>
              <p className="text-[11px] font-bold text-slate-500 mb-1">Executed pathway</p>
              <div className="space-y-1">
                {history.map((h, i) => {
                  const ev = nodeEvidence(h.node, sources);
                  return (
                    <div key={i} className={`text-[11px] border-l-2 pl-2 ${h.suppressed ? 'border-red-400' : 'border-slate-200'}`}>
                      <span className="text-slate-600">{h.suppressed ? `[Blocked] ${h.node.action}` : (h.node.question || h.node.action)}</span>
                      {h.choiceLabel && <span className="font-semibold text-slate-700"> → {shortAnswer(h.choiceLabel)}</span>}
                      {ev?.grade && <span className="text-[9px] text-slate-400 ml-1">(Grade {ev.grade})</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {suppressions.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                <p className="text-[11px] font-bold text-red-700 mb-1">Prescription suppression log</p>
                {suppressions.map((ev, i) => (
                  <p key={i} className="text-[11px] text-red-700">
                    {ev.drug} blocked — {ev.acmg_class} variant{ev.gene ? ` in ${ev.gene}` : ''}
                  </p>
                ))}
              </div>
            )}

            {monitoring.length > 0 && (
              <div>
                <p className="text-[11px] font-bold text-slate-500 mb-1 flex items-center gap-1"><Activity className="w-3 h-3" /> Monitoring schedule</p>
                <div className="space-y-1.5">
                  {monitoring.map((r, i) => (
                    <div key={i} className="bg-slate-50 rounded p-2 border border-slate-100">
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
          </div>
        </details>
      )}

      {/* footer action */}
      {isTerminal ? (
        <Button variant="outline" size="sm" className="w-full" onClick={onReset || restart}>Run Again</Button>
      ) : (
        <button onClick={restart} className="w-full text-[11px] text-slate-400 underline text-center">Restart pathway</button>
      )}
    </div>
  );
}
