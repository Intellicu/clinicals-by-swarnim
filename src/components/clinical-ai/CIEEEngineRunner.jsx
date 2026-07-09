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
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { usePatient } from "@/components/PatientContext";
import { Button } from "@/components/ui/button";
import {
  FlaskConical, ShieldAlert, Activity, BookOpen, Flag, ChevronRight, ChevronLeft,
  Pill, AlertTriangle, ExternalLink,
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

// Mosteller body surface area (m²)
function bsaMosteller(weightKg, heightCm) {
  const w = parseFloat(weightKg), h = parseFloat(heightCm);
  if (!w || !h) return null;
  return Math.sqrt((w * h) / 3600);
}

// Millilitre / milligram / microgram formatters. fmtMg keeps decimals for
// small (sub-10 mg) doses so life-saving drugs like adrenaline (0.01 mg/kg →
// e.g. 0.15 mg) render as a real number instead of rounding to "0 mg".
const fmtMg = (x) => {
  if (x >= 1000) return `${(x / 1000).toFixed(x % 1000 ? 1 : 0)} g`;
  if (x < 10) return `${parseFloat(x.toFixed(2))} mg`;
  return `${Math.round(x)} mg`;
};
const fmtMcg = (x) => (x >= 1000 ? `${parseFloat((x / 1000).toFixed(2))} mg` : `${parseFloat(x.toFixed(x < 10 ? 2 : 1))} mcg`);

// Parse a free-text dose rule and compute the patient-specific dose. Handles
// weight-based mg/kg (maintenance "/day" or emergency per-dose), microgram
// boluses & infusions (mcg/kg, mcg/kg/min), millilitre fluid boluses (mL/kg),
// and BSA mg/m². A single string may contain several (e.g. "3rd IM adrenaline
// 0.01 mg/kg (max 0.5 mg); then IV adrenaline 0.05 mcg/kg/min") — each is
// computed and shown.
function computeDose(doseStr, { weight, height } = {}) {
  if (!doseStr) return null;
  const w = parseFloat(weight);
  const out = [];
  const dayS = /\/day/i.test(doseStr) ? '/day' : ''; // per-day vs per-dose

  // mg/kg (won't match "mcg/kg" — no "mg/kg" substring exists there)
  const perKg = doseStr.match(/([\d.]+)\s*(?:[–-]\s*([\d.]+))?\s*mg\/kg/i);
  if (perKg && w) {
    const maxM = doseStr.match(/max[:\s]*([\d.]+)\s*(mg|g)/i);
    const maxMg = maxM ? parseFloat(maxM[1]) * (maxM[2].toLowerCase() === "g" ? 1000 : 1) : null;
    const cap = (x) => (maxMg ? Math.min(x, maxMg) : x);
    const lo = cap(parseFloat(perKg[1]) * w);
    const hi = perKg[2] ? cap(parseFloat(perKg[2]) * w) : null;
    out.push(hi ? `${fmtMg(lo)}–${fmtMg(hi)}${dayS}` : `${fmtMg(lo)}${dayS}`);
  }

  // mcg/kg (bolus) and mcg/kg/min (infusion rate)
  const perKgMcg = doseStr.match(/([\d.]+)\s*(?:[–-]\s*([\d.]+))?\s*mcg\/kg(\/min)?/i);
  if (perKgMcg && w) {
    const per = perKgMcg[3] ? '/min' : '';
    const maxM = doseStr.match(/max[:\s]*([\d.]+)\s*(mg|mcg)/i);
    const maxMcg = maxM ? parseFloat(maxM[1]) * (maxM[2].toLowerCase() === "mg" ? 1000 : 1) : null;
    const cap = (x) => (maxMcg ? Math.min(x, maxMcg) : x);
    const lo = cap(parseFloat(perKgMcg[1]) * w);
    const hi = perKgMcg[2] ? cap(parseFloat(perKgMcg[2]) * w) : null;
    out.push(hi ? `${fmtMcg(lo)}–${fmtMcg(hi)}${per}` : `${fmtMcg(lo)}${per}`);
  }

  // mL/kg fluid bolus
  const perKgMl = doseStr.match(/([\d.]+)\s*(?:[–-]\s*([\d.]+))?\s*m[lL]\/kg/i);
  if (perKgMl && w) {
    const lo = parseFloat(perKgMl[1]) * w;
    const hi = perKgMl[2] ? parseFloat(perKgMl[2]) * w : null;
    out.push(hi ? `${Math.round(lo)}–${Math.round(hi)} mL` : `${Math.round(lo)} mL`);
  }

  const perM2 = doseStr.match(/([\d.]+)\s*(?:[–-]\s*([\d.]+))?\s*mg\/m/i);
  const bsa = bsaMosteller(weight, height);
  if (perM2 && bsa) {
    const lo = parseFloat(perM2[1]) * bsa;
    const hi = perM2[2] ? parseFloat(perM2[2]) * bsa : null;
    out.push((hi ? `${fmtMg(lo)}–${fmtMg(hi)}${dayS}` : `${fmtMg(lo)}${dayS}`) + ` (BSA ${bsa.toFixed(2)} m²)`);
  }

  return out.length ? out.join(" · ") : null;
}

function EvidenceLine({ node, sources }) {
  const ev = nodeEvidence(node, sources);
  if (!ev) return null;
  return (
    <div className="flex items-center gap-1.5 mt-3 flex-wrap">
      {ev.grade && <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">Grade {ev.grade}</span>}
      <span className="text-[10px] text-slate-400">{ev.name}{ev.section ? ` · ${ev.section}` : ''}</span>
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
  pathway, sources, initialCtx = {}, recommend, onReset, entry,
  title = 'CIEE Pathway Engine', subtitle,
}) {
  const startNode = entry || pathway.entry;
  const [nodeId, setNodeId] = useState(startNode);
  const [ctx, setCtx] = useState(initialCtx);
  const [history, setHistory] = useState([]);
  const [monitoring, setMonitoring] = useState([]);
  const [suppressions, setSuppressions] = useState([]);
  const [acks, setAcks] = useState({}); // acknowledged safety gates, keyed `${nodeId}:${i}`
  // Patient parameters for weight/BSA-based dosing — shared app-wide so the
  // dose calculator and all calculators auto-fill (true round-trip).
  const { patientData, updatePatientData } = usePatient();
  const [pt, setPt] = useState({
    weight: patientData?.weight || initialCtx.weight_kg || '',
    height: patientData?.height || initialCtx.height_cm || '',
    age: patientData?.age || initialCtx.age_years || '',
  });
  const setPatientField = (k, v) => {
    setPt(p => ({ ...p, [k]: v }));
    updatePatientData({ ...patientData, [k]: v }); // sync to shared store
  };

  const node = pathway.nodes[nodeId];

  // where a suppressed prescription redirects: prefer an ACE-I/supportive node, else just continue
  const suppressRedirect = () => {
    const ids = Object.keys(pathway.nodes);
    const aceNode = ids.find(id => /ace|supportive|enalapril|ramipril|losartan/i.test(pathway.nodes[id].action || ''));
    return aceNode || node.next;
  };

  const restart = () => {
    setNodeId(startNode); setCtx(initialCtx);
    setHistory([]); setMonitoring([]); setSuppressions([]);
  };

  // Each history entry stores a snapshot of the state BEFORE that node ran,
  // so we can jump back to any earlier step and resume from there.
  const choose = (opt) => {
    if (gateItems.length && !gatesMet) return; // safety gate
    const snapshot = { ctx, monitoring, suppressions };
    setCtx({ ...ctx, ...(opt.set || {}) });
    setHistory(h => [...h, { node, choiceLabel: opt.label, snapshot, acknowledged: gateItems.length ? acknowledgedTitles() : undefined }]);
    setNodeId(opt.next);
  };

  const advance = () => {
    const snapshot = { ctx, monitoring, suppressions };
    if (isPrescriptionNode(node) && supp.suppressed) {
      setSuppressions(s => [...s, supp.suppression_event]);
      setHistory(h => [...h, { node, suppressed: true, reason: supp.reason, snapshot }]);
      setNodeId(suppressRedirect());
      return;
    }
    if (gateItems.length && !gatesMet) return; // safety gate
    const rules = rulesForNode(node, ctx);
    if (rules.length) {
      setMonitoring(m => {
        const merged = [...m, ...rules];
        return [...new Map(merged.map(r => [r.rule_id, r])).values()];
      });
    }
    setHistory(h => [...h, { node, snapshot, acknowledged: gateItems.length ? acknowledgedTitles() : undefined }]);
    setNodeId(node.next);
  };

  // Jump back to a previous step (re-opens that node, restoring prior state).
  const goTo = (index) => {
    if (index < 0 || index >= history.length) return;
    const { snapshot, node: target } = history[index];
    setCtx(snapshot.ctx);
    setMonitoring(snapshot.monitoring);
    setSuppressions(snapshot.suppressions);
    setNodeId(target.id);
    setHistory(history.slice(0, index));
  };

  const back = () => { if (history.length) goTo(history.length - 1); };

  // ── Phone/browser Back button → step back inside the engine ────────────────
  // Without this, the hardware Back leaves the whole page. We arm a history
  // guard while steps exist and consume Back to walk the engine backwards.
  const histLenRef = useRef(history.length);
  histLenRef.current = history.length;
  const backRef = useRef(back);
  backRef.current = back;
  const armedRef = useRef(false);

  useEffect(() => {
    const onPop = () => {
      if (histLenRef.current > 0) {
        backRef.current();
        if (histLenRef.current > 1) window.history.pushState(null, ''); // re-arm if steps remain
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    if (history.length > 0 && !armedRef.current) {
      window.history.pushState(null, ''); // same URL — won't trigger router navigation
      armedRef.current = true;
    } else if (history.length === 0) {
      armedRef.current = false;
    }
  }, [history.length]);

  if (!node) return <div className="text-xs text-red-600">Pathway error: node "{nodeId}" not found.</div>;

  const supp = isPrescriptionNode(node) ? checkPrescriptionSuppressor(node.prescribes, ctx) : { suppressed: false };

  const isQuestion = node.type === 'QUESTION' || node.type === 'ASSESSMENT';
  const isTerminal = node.type === 'TERMINAL';
  const recIdx = isQuestion && recommend ? recommend(node, ctx) : -1;
  const hasRx = Object.values(pathway.nodes).some(n => n.rx);

  // Hard safety gates — must be acknowledged before this step can proceed.
  const gateItems = (node.safety || []).map((s, i) => ({ s, i })).filter(x => x.s.gate);
  const gatesMet = gateItems.every(x => acks[`${node.id}:${x.i}`]);
  const toggleAck = (i) => setAcks(a => ({ ...a, [`${node.id}:${i}`]: !a[`${node.id}:${i}`] }));
  const acknowledgedTitles = () => gateItems.map(x => x.s.ack || x.s.title);

  return (
    <div className="space-y-4">
      {/* header */}
      <div className="flex items-center gap-2.5 px-1">
        <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
          <FlaskConical className="w-5 h-5 text-indigo-700" />
        </div>
        <div className="min-w-0">
          <p className="text-base font-bold text-slate-900 truncate">
            {title}
            <span className="ml-2 align-middle text-[10px] font-bold text-violet-700 bg-violet-100 px-1.5 py-0.5 rounded-full">UI v3</span>
          </p>
          {subtitle && <p className="text-xs text-slate-500 truncate">{subtitle}</p>}
        </div>
      </div>

      {/* patient parameters for weight/BSA-based dosing */}
      {hasRx && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Pill className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Patient — for dosing</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { k: 'weight', label: 'Weight (kg)' },
              { k: 'height', label: 'Height (cm)' },
              { k: 'age', label: 'Age (yr)' },
            ].map(f => (
              <div key={f.k}>
                <label className="text-[10px] text-slate-500 block mb-0.5">{f.label}</label>
                <input type="number" inputMode="decimal" value={pt[f.k]}
                  onChange={e => setPatientField(f.k, e.target.value)}
                  className="w-full text-sm h-8 px-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200" />
              </div>
            ))}
          </div>
          {pt.weight && pt.height && (
            <p className="text-[10px] text-slate-400 mt-1.5">BSA (Mosteller) ≈ {bsaMosteller(pt.weight, pt.height).toFixed(2)} m²</p>
          )}
        </div>
      )}

      {/* timeline */}
      <div className="relative pl-8 pt-1">
        <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-slate-300" />

        {/* completed steps — collapsed, click to go back */}
        {history.map((h, i) => {
          const ans = h.suppressed ? 'Blocked' : (h.choiceLabel ? shortAnswer(h.choiceLabel) : null);
          return (
            <button key={i} onClick={() => goTo(i)} title="Go back to this step"
              className="relative mb-3.5 block w-full text-left group">
              <span className={`absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white ${h.suppressed ? 'bg-red-500' : 'bg-violet-500 group-hover:bg-violet-700'}`} />
              <div className="flex items-baseline gap-2 min-w-0">
                <span className={`text-[15px] leading-snug truncate group-hover:text-violet-700 ${h.suppressed ? 'text-red-600' : 'text-slate-600'}`}>{h.node.question || h.node.action}</span>
                {ans && <span className={`text-[15px] font-bold leading-snug flex-shrink-0 ${h.suppressed ? 'text-red-700' : 'text-slate-900'}`}>{ans}</span>}
              </div>
            </button>
          );
        })}

        {/* current node — expanded, in a white card for contrast */}
        {!isTerminal && (
          <div className="relative">
            <span className="absolute -left-[30px] top-4 w-4 h-4 rounded-full bg-violet-600 ring-4 ring-violet-100" />
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
            <p className="text-[21px] leading-snug font-bold text-slate-900">{node.question || node.action}</p>
            {node.detail && <p className="text-sm text-slate-600 mt-2 leading-relaxed">{node.detail}</p>}
            {Array.isArray(node.points) && node.points.length > 0 && (
              <ul className="mt-2.5 space-y-1.5">
                {node.points.map((p, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-700 leading-relaxed">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            )}

            {isPrescriptionNode(node) && supp.suppressed && (
              <div className="mt-4 bg-red-50 border-2 border-red-300 rounded-xl px-4 py-3 flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 leading-relaxed"><span className="font-bold">Prescription blocked. </span>{supp.reason}</p>
              </div>
            )}

            {/* Prescription (drug + dose) — links to the prescriber tool */}
            {node.rx && !(isPrescriptionNode(node) && supp.suppressed) && (
              <div className="mt-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Pill className="w-4 h-4 text-emerald-700" />
                  <span className="text-sm font-bold text-emerald-900">Prescription</span>
                </div>
                <p className="text-[15px] font-semibold text-slate-900">{node.rx.drug}</p>
                {node.rx.dose && <p className="text-sm text-slate-700 mt-0.5">{node.rx.dose}</p>}
                <div className="flex gap-2 mt-1 flex-wrap">
                  {node.rx.route && <span className="text-[11px] bg-white border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full">{node.rx.route}</span>}
                  {node.rx.duration && <span className="text-[11px] bg-white border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full">{node.rx.duration}</span>}
                </div>
                {/* Patient-specific computed dose */}
                {(() => {
                  const computed = computeDose(node.rx.dose, pt);
                  if (computed) {
                    return (
                      <div className="mt-2.5 bg-white border border-emerald-300 rounded-lg px-3 py-2">
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">Calculated for {pt.weight} kg</span>
                        <p className="text-[15px] font-bold text-emerald-900">≈ {computed}</p>
                      </div>
                    );
                  }
                  return (
                    <p className="mt-2 text-[12px] text-emerald-700/70 italic">Enter weight{node.rx.dose && /mg\/m/i.test(node.rx.dose) ? ' + height' : ''} above to calculate the dose.</p>
                  );
                })()}
                <Link to={createPageUrl("DrugsDosing") + `?drug=${encodeURIComponent(node.prescribes || node.rx.drug)}`}
                  className="inline-flex items-center gap-1 text-[13px] font-semibold text-emerald-700 hover:text-emerald-900 mt-2.5">
                  Open full dose calculator <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* Safety constraints — advisory notes + hard gates (must confirm to proceed) */}
            {Array.isArray(node.safety) && node.safety.length > 0 && (
              <div className="mt-3 space-y-2">
                {node.safety.map((s, i) => {
                  const checked = !!acks[`${node.id}:${i}`];
                  if (!s.gate) {
                    return (
                      <div key={i} className="bg-amber-50 border border-amber-300 rounded-lg px-3 py-2.5 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-[13px] text-amber-800 leading-relaxed"><span className="font-bold">{s.title}: </span>{s.detail}</p>
                      </div>
                    );
                  }
                  return (
                    <button key={i} type="button" onClick={() => toggleAck(i)}
                      className={`w-full text-left rounded-lg px-3 py-2.5 border-2 flex items-start gap-2.5 transition-all
                        ${checked ? 'bg-emerald-50 border-emerald-300' : 'bg-red-50 border-red-300'}`}>
                      <span className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 border-2 ${checked ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-red-400'}`}>
                        {checked ? '✓' : <ShieldAlert className="w-3.5 h-3.5 text-red-500" />}
                      </span>
                      <span>
                        <span className={`block text-[13px] font-bold ${checked ? 'text-emerald-800' : 'text-red-800'}`}>
                          {s.title} {!checked && <span className="text-[10px] font-bold uppercase bg-red-200 text-red-800 px-1.5 py-0.5 rounded ml-1">required</span>}
                        </span>
                        <span className="block text-[12px] text-slate-600 leading-relaxed mt-0.5">{s.detail}</span>
                        <span className={`block text-[12px] font-semibold mt-1 ${checked ? 'text-emerald-700' : 'text-red-700'}`}>
                          {checked ? '✓ ' : '☐ '}{s.ack || 'Confirm documented'}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Evaluation / investigations — card layout, matching monitoring */}
            {Array.isArray(node.investigations) && node.investigations.length > 0 && (
              <div className="mt-3 bg-blue-50/50 border border-blue-200 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <FlaskConical className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-bold text-blue-800">Evaluation &amp; investigations</span>
                </div>
                <div className="space-y-1.5">
                  {node.investigations.map((iv, i) => (
                    <div key={i} className="bg-white rounded-lg border border-blue-100 border-l-4 border-l-blue-400 p-2.5">
                      <span className="text-[13px] font-bold text-slate-800">{iv.test}</span>
                      {iv.detail && <p className="text-[12px] text-slate-600 mt-0.5 leading-relaxed">{iv.detail}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Monitoring attached to this step */}
            {Array.isArray(node.monitoring) && node.monitoring.length > 0 && (
              <div className="mt-3 bg-indigo-50/50 border border-indigo-200 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Activity className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-bold text-indigo-800">Monitoring schedule</span>
                </div>
                <div className="space-y-1.5">
                  {node.monitoring.map((m, i) => (
                    <div key={i} className="bg-white rounded-lg border border-indigo-100 border-l-4 border-l-indigo-400 p-2.5">
                      <span className="text-[13px] font-bold text-slate-800">{m.parameter}</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {m.frequency && (
                          <span className="inline-flex items-center text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">
                            🕒 {m.frequency}
                          </span>
                        )}
                        {m.target && (
                          <span className="inline-flex items-center text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                            🎯 {m.target}
                          </span>
                        )}
                      </div>
                      {m.alert && <p className="text-[11px] text-red-600 mt-1.5">⚠ {m.alert}{m.alert_action ? ` → ${m.alert_action}` : ''}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Supportive care — structured cards (same clean layout as monitoring) */}
            {Array.isArray(node.care) && node.care.length > 0 && (
              <div className="mt-3 bg-teal-50/50 border border-teal-200 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <ShieldAlert className="w-4 h-4 text-teal-600" />
                  <span className="text-sm font-bold text-teal-800">Supportive care</span>
                </div>
                <div className="space-y-1.5">
                  {node.care.map((c, i) => (
                    <div key={i} className="bg-white rounded-lg border border-teal-100 border-l-4 border-l-teal-400 p-2.5">
                      <span className="text-[13px] font-bold text-slate-800">{c.category}</span>
                      {c.detail && <p className="text-[12px] text-slate-600 mt-0.5 leading-relaxed">{c.detail}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Required-confirmation hint when a safety gate is unmet */}
            {gateItems.length > 0 && !gatesMet && (
              <p className="mt-4 text-[12px] font-semibold text-red-700">Confirm the required safety item(s) above to continue.</p>
            )}

            {/* Action — options (question) or Continue (action) */}
            {isQuestion && (
              <div className="flex flex-col gap-2.5 mt-4">
                {(node.options || []).map((opt, i) => (
                  <button key={i} onClick={() => choose(opt)} disabled={gateItems.length > 0 && !gatesMet}
                    className={`px-5 py-3.5 rounded-xl text-[16px] font-semibold text-left shadow-sm transition-all flex items-center justify-between gap-2 disabled:opacity-50 disabled:cursor-not-allowed
                      ${opt.tone === 'danger' ? 'bg-rose-600 text-white hover:bg-rose-700'
                        : opt.tone === 'muted' ? 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200'
                        : 'bg-violet-600 text-white hover:bg-violet-700'}
                      ${i === recIdx ? 'ring-2 ring-offset-2 ring-violet-400' : ''}`}>
                    <span>{opt.label}</span>
                    <span className="flex items-center gap-1.5 flex-shrink-0">
                      {i === recIdx && <span className="text-[10px] bg-white/25 text-white px-2 py-0.5 rounded-full font-bold">suggested</span>}
                      <ChevronRight className="w-5 h-5 opacity-70" />
                    </span>
                  </button>
                ))}
              </div>
            )}

            {!isQuestion && (
              <Button onClick={advance} disabled={gateItems.length > 0 && !gatesMet}
                className={`mt-4 ${supp.suppressed ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white text-base h-12 px-6 rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`}>
                {supp.suppressed ? 'Continue → supportive pathway' : 'Continue'}
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            )}

            {history.length > 0 && (
              <button onClick={back} className="mt-4 ml-3 inline-flex items-center gap-1 text-[13px] font-medium text-slate-400 hover:text-indigo-700">
                <ChevronLeft className="w-4 h-4" /> Back to previous step
              </button>
            )}

            <EvidenceLine node={node} sources={sources} />
            </div>
          </div>
        )}

        {/* terminal — flag + conclusion */}
        {isTerminal && (
          <div className="relative">
            <span className="absolute -left-[30px] -top-0.5 text-emerald-600"><Flag className="w-5 h-5" /></span>
            <p className="text-[21px] leading-snug font-bold text-slate-900">{node.action}</p>
            <EvidenceLine node={node} sources={sources} />
          </div>
        )}
      </div>

      {/* terminal — CIEE detail (collapsible) */}
      {isTerminal && (
        <details className="bg-white border border-slate-200 rounded-xl">
          <summary className="px-3 py-2.5 text-sm font-semibold text-slate-700 cursor-pointer flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-slate-400" /> Evidence, monitoring &amp; audit trail
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
                      {Array.isArray(h.acknowledged) && h.acknowledged.map((a, j) => (
                        <span key={j} className="block text-[10px] text-emerald-700">✓ {a}</span>
                      ))}
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
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={back} disabled={!history.length}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={onReset || restart}>Run Again</Button>
        </div>
      ) : (
        <button onClick={restart} className="w-full text-[11px] text-slate-300 hover:text-slate-500 underline text-center">Restart pathway</button>
      )}
    </div>
  );
}