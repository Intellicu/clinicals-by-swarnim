/**
 * CIEE Pathway Explorer
 * Executes the SRNS pathway using the 7-component CIEEEngine.
 * Demonstrates context-divergent pathway execution per patent.
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Cpu, Play, ShieldAlert, ShieldCheck, AlertTriangle, BookOpen, CheckCircle, XCircle, Activity } from 'lucide-react';
import { executeSRNSPathway, buildTraceabilityLink } from '@/lib/CIEEEngine';

const NODE_TYPE_STYLE = {
  QUESTION: 'bg-blue-50 border-blue-300 text-blue-800',
  ACTION: 'bg-green-50 border-green-300 text-green-800',
  ASSESSMENT: 'bg-purple-50 border-purple-300 text-purple-800',
  MONITORING: 'bg-amber-50 border-amber-300 text-amber-800',
  TERMINAL: 'bg-slate-50 border-slate-300 text-slate-700',
  SUPPRESSED: 'bg-red-50 border-red-400 text-red-800',
};

const ACMG_OPTIONS = ['Pathogenic', 'Likely Pathogenic', 'VUS', 'Likely Benign', 'Benign', 'Unknown'];
const HISTOLOGY_OPTIONS = ['FSGS', 'MCD', 'Membranous', 'IgAN', 'MesPGN', 'Other', 'Unknown'];
const CNI_RESPONSE_OPTIONS = ['RESPONSE', 'PARTIAL', 'FAILURE', 'Not yet assessed'];

export default function CIEEPathwayExplorer() {
  const [ctx, setCtx] = useState({
    age_months: '',
    weight_kg: '',
    height_cm: '',
    creatinine_mg_dL: '',
    acmg_class: 'Unknown',
    genetic_gene: '',
    genetic_variant_status: 'UNKNOWN',
    biopsy_histology: 'Unknown',
    prior_cni_response: 'Not yet assessed',
    dialysis_status: false,
    tdm_in_range: true,
  });
  const [result, setResult] = useState(null);
  const [activeView, setActiveView] = useState('input');

  const update = (field, value) => setCtx(prev => ({ ...prev, [field]: value }));

  const runPathway = () => {
    const execCtx = {
      ...ctx,
      age_months: ctx.age_months ? parseFloat(ctx.age_months) : null,
      weight_kg: ctx.weight_kg ? parseFloat(ctx.weight_kg) : null,
      height_cm: ctx.height_cm ? parseFloat(ctx.height_cm) : null,
      creatinine_mg_dL: ctx.creatinine_mg_dL ? parseFloat(ctx.creatinine_mg_dL) : null,
      genetic_variant_status: ['Pathogenic', 'Likely Pathogenic'].includes(ctx.acmg_class) ? 'PATHOGENIC' : ctx.acmg_class === 'Unknown' ? 'UNKNOWN' : 'NON_PATHOGENIC',
    };
    const res = executeSRNSPathway(execCtx);
    setResult(res);
    setActiveView('results');
  };

  const hasSuppression = result?.suppression_log?.length > 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 to-violet-700 rounded-2xl p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Cpu className="w-5 h-5" />
          <h2 className="font-bold text-base">CIEE Pathway Engine</h2>
        </div>
        <p className="text-indigo-200 text-xs">Clinical Intelligence Execution Engine · SRNS Pathway (ISPN 2021)</p>
        <p className="text-indigo-300 text-[10px] mt-1">7-Component Architecture: GuidelineSource → DecisionNode → PatientContext → PathwayExecution → MonitoringRules → PrescriptionSuppressor → TraceabilityLinker</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        <button onClick={() => setActiveView('input')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${activeView === 'input' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          Patient Context
        </button>
        {result && (
          <button onClick={() => setActiveView('results')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${activeView === 'results' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            Pathway Output
            {hasSuppression && <ShieldAlert className="w-3 h-3 text-red-500" />}
          </button>
        )}
        {result && (
          <button onClick={() => setActiveView('monitoring')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${activeView === 'monitoring' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            Monitoring
          </button>
        )}
      </div>

      {/* ── Patient Context Input ── */}
      {activeView === 'input' && (
        <div className="space-y-4">
          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="text-blue-800 text-xs">
              Enter the patient context vector. The CIEE engine evaluates each field to determine the appropriate pathway branch — the same guideline source produces wholly distinct outputs for different patient contexts.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-700">Demographics & Biometrics</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Age (months)</label>
                <Input type="number" value={ctx.age_months} onChange={e => update('age_months', e.target.value)} placeholder="e.g. 48" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Weight (kg)</label>
                <Input type="number" value={ctx.weight_kg} onChange={e => update('weight_kg', e.target.value)} placeholder="e.g. 18" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Height (cm)</label>
                <Input type="number" value={ctx.height_cm} onChange={e => update('height_cm', e.target.value)} placeholder="e.g. 105" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Creatinine (mg/dL)</label>
                <Input type="number" step="0.01" value={ctx.creatinine_mg_dL} onChange={e => update('creatinine_mg_dL', e.target.value)} placeholder="e.g. 0.7" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-700">Genetics (ACMG Classification)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">ACMG Class</label>
                <div className="flex flex-wrap gap-1.5">
                  {ACMG_OPTIONS.map(opt => (
                    <button key={opt} onClick={() => update('acmg_class', opt)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${ctx.acmg_class === opt
                        ? opt === 'Pathogenic' || opt === 'Likely Pathogenic' ? 'bg-red-600 text-white border-red-600' : 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-400'}`}>
                      {opt}
                    </button>
                  ))}
                </div>
                {(ctx.acmg_class === 'Pathogenic' || ctx.acmg_class === 'Likely Pathogenic') && (
                  <div className="mt-2 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <p className="text-xs text-red-800">PrescriptionSuppressor will activate — CNI contraindicated</p>
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Causative Gene (if known)</label>
                <Input value={ctx.genetic_gene} onChange={e => update('genetic_gene', e.target.value)} placeholder="e.g. NPHS2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-700">Biopsy & Treatment History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Biopsy Histology</label>
                <div className="flex flex-wrap gap-1.5">
                  {HISTOLOGY_OPTIONS.map(opt => (
                    <button key={opt} onClick={() => update('biopsy_histology', opt)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${ctx.biopsy_histology === opt ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-slate-600 border-slate-300 hover:border-purple-400'}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Prior CNI Response</label>
                <div className="flex flex-wrap gap-1.5">
                  {CNI_RESPONSE_OPTIONS.map(opt => (
                    <button key={opt} onClick={() => update('prior_cni_response', opt)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${ctx.prior_cni_response === opt ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-slate-600 border-slate-300 hover:border-amber-400'}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Dialysis Status</label>
                <div className="flex gap-2">
                  {[false, true].map(val => (
                    <button key={String(val)} onClick={() => update('dialysis_status', val)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${ctx.dialysis_status === val ? 'bg-slate-700 text-white border-slate-700' : 'bg-white text-slate-600 border-slate-300'}`}>
                      {val ? 'On Dialysis' : 'Not on Dialysis'}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={runPathway} className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2">
            <Play className="w-4 h-4" /> Execute SRNS Pathway
          </Button>
        </div>
      )}

      {/* ── Pathway Output ── */}
      {activeView === 'results' && result && (
        <div className="space-y-4">
          {/* Suppression alert */}
          {hasSuppression && (
            <div className="bg-red-50 border-2 border-red-400 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <p className="font-bold text-red-900 text-sm">PRESCRIPTION SUPPRESSOR ACTIVATED</p>
                  {result.suppression_log.map((evt, i) => (
                    <div key={i} className="mt-1">
                      <p className="text-xs text-red-800"><strong>{evt.drug}</strong> suppressed — {evt.acmg_class} variant in {evt.gene || 'nephrotic gene'}</p>
                      <p className="text-[10px] text-red-600">Rule: {evt.rule_id} · {new Date(evt.ts).toLocaleTimeString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Pathway summary */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-bold text-sm text-slate-800">{result.pathway_name}</p>
                <p className="text-xs text-slate-500">{result.pathway_output.length} nodes traversed</p>
              </div>
              {result.completed
                ? <Badge className="bg-green-600 text-white flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Complete</Badge>
                : <Badge className="bg-amber-500 text-white">In Progress</Badge>
              }
            </div>

            {/* eGFR computed */}
            {result.context_vector.egfr && (
              <div className="bg-blue-50 rounded-lg px-3 py-2 mb-3 text-xs">
                <span className="font-semibold text-blue-800">eGFR: </span>
                <span className="text-blue-700">{result.context_vector.egfr.toFixed(1)} mL/min/1.73m²</span>
                {result.context_vector.egfr_source === 'schwartz_calculated' && <span className="text-blue-500 ml-1">(Schwartz formula)</span>}
              </div>
            )}
          </div>

          {/* Node traversal */}
          <div className="space-y-2">
            {result.pathway_output.map((step, i) => {
              const style = NODE_TYPE_STYLE[step.type] || NODE_TYPE_STYLE.ACTION;
              return (
                <div key={i} className={`rounded-xl border p-3 ${style}`}>
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] font-mono bg-white/60 rounded px-1.5 py-0.5 flex-shrink-0">{step.node_id}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                        <Badge className="text-[9px] py-0 bg-white/70 text-current border-0">{step.type}</Badge>
                        {step.type === 'SUPPRESSED' && <ShieldAlert className="w-3 h-3 text-red-600" />}
                      </div>
                      <p className="text-xs font-medium">{step.action}</p>
                      {step.reason && <p className="text-[10px] mt-1 opacity-80">{step.reason}</p>}
                      {step.trace?.evidence_grade && (
                        <p className="text-[9px] mt-1 opacity-70">
                          {step.trace.guideline_name} · Grade {step.trace.evidence_grade} · {step.trace.recommendation_strength}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Evaluation log for critical branches */}
          {result.evaluation_log?.length > 0 && (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-3">
              <p className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Critical Branch Evaluation Log
              </p>
              <div className="space-y-1.5">
                {result.evaluation_log.map((log, i) => (
                  <div key={i} className="bg-white rounded-lg p-2 border border-slate-100">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-mono text-slate-500">{log.node_id}</span>
                      <Badge variant="outline" className="text-[9px] py-0">Critical</Badge>
                    </div>
                    <p className="text-xs text-slate-700">{log.clinical_question}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1 text-[10px] text-slate-500">
                      {log.context_snapshot.acmg_class && <span>ACMG: {log.context_snapshot.acmg_class}</span>}
                      {log.context_snapshot.biopsy_histology && log.context_snapshot.biopsy_histology !== 'Unknown' && <span>Biopsy: {log.context_snapshot.biopsy_histology}</span>}
                      {log.context_snapshot.dialysis_status && <span className="text-red-600 font-semibold">On Dialysis</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button variant="outline" size="sm" className="w-full" onClick={() => { setResult(null); setActiveView('input'); }}>
            Run New Pathway
          </Button>
        </div>
      )}

      {/* ── Monitoring Rules ── */}
      {activeView === 'monitoring' && result && (
        <div className="space-y-3">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-xs font-bold text-amber-800 mb-1 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" /> Generated Monitoring Rules (MonitoringRuleGenerator)
            </p>
            <p className="text-xs text-amber-700">{result.monitoring_rules.length} rule(s) generated from pathway context</p>
          </div>

          {result.monitoring_rules.length === 0 && (
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500">No monitoring rules generated — pathway may have been suppressed or redirected.</p>
            </div>
          )}

          {result.monitoring_rules.map((rule, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-sm text-slate-800">{rule.monitoring_parameter}</p>
                {rule.drug_name && <Badge variant="outline" className="text-xs">{rule.drug_name}</Badge>}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500">Frequency</span>
                  <p className="font-medium text-slate-800">{rule.frequency}</p>
                </div>
                <div>
                  <span className="text-slate-500">Target</span>
                  <p className="font-medium text-slate-800">{rule.target_value}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500">Alert Condition</span>
                  <p className="font-medium text-amber-700">{rule.alert_condition}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500">Alert Action</span>
                  <p className="font-medium text-green-700">{rule.alert_action}</p>
                </div>
              </div>
              {(rule.evidence_grade || rule.guideline_name) && (
                <div className="mt-2 pt-2 border-t border-slate-100 flex gap-1.5 flex-wrap">
                  {rule.evidence_grade && <Badge variant="outline" className="text-[9px] py-0">Grade {rule.evidence_grade}</Badge>}
                  {rule.guideline_name && <span className="text-[9px] text-slate-400 self-center">{rule.guideline_name}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
