import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, Loader2, TestTube, AlertTriangle, FlaskConical, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { invokeLabAnalyzer } from '@/lib/LLMService';
import { buildTraceabilityLink } from '@/lib/CIEEEngine';

const LAB_TYPES = ['RFT', 'VBG', 'ABG', 'Electrolytes', 'Urine Analysis', 'CBC', 'LFT', 'Lipids'];

const SCHWARTZ_INFO = 'Schwartz formula: eGFR = (0.413 × height_cm) / Cr_mg/dL';

export default function LabReportAnalyzer() {
  const [labType, setLabType] = useState('RFT');
  const [labFile, setLabFile] = useState(null);
  const [labText, setLabText] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientHeightCm, setPatientHeightCm] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('analyze');

  const handleAnalyze = async () => {
    if (!labFile && !labText.trim()) return;
    setLoading(true);
    try {
      const result = await invokeLabAnalyzer({
        labText,
        labFile,
        labType,
        patientAge,
        patientHeightCm: patientHeightCm ? parseFloat(patientHeightCm) : null,
      });

      if (!result.success) {
        toast.error('Analysis failed — please try again');
        return;
      }

      setAnalysis(result.data);
      setActiveTab('results');
      toast.success('Lab analysis complete!');
    } catch {
      toast.error('Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const trace = analysis ? buildTraceabilityLink('GS-IPNA-2021-NS', { source: 'LabAI' }) : null;
  const ev = analysis;

  return (
    <div className="space-y-4">
      {/* Tab Bar */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        <button onClick={() => setActiveTab('analyze')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'analyze' ? 'bg-white text-green-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          <TestTube className="w-3.5 h-3.5" /> Analyze Lab
        </button>
        {analysis && (
          <button onClick={() => setActiveTab('results')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'results' ? 'bg-white text-green-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <FlaskConical className="w-3.5 h-3.5" /> Results
          </button>
        )}
        <button onClick={() => setActiveTab('reference')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'reference' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          <BookOpen className="w-3.5 h-3.5" /> Reference
        </button>
      </div>

      {/* ── Analyze Tab ── */}
      {activeTab === 'analyze' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TestTube className="w-5 h-5 text-green-600" />
              Lab Report AI Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">Lab Test Type</label>
              <div className="flex flex-wrap gap-2">
                {LAB_TYPES.map(type => (
                  <Button key={type} variant={labType === type ? 'default' : 'outline'} size="sm"
                    onClick={() => setLabType(type)} className={labType === type ? 'bg-green-600' : ''}>
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Patient Age (years)</label>
                <Input type="number" value={patientAge} onChange={e => setPatientAge(e.target.value)}
                  placeholder="e.g. 8" />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Height (cm) — for Schwartz GFR</label>
                <Input type="number" value={patientHeightCm} onChange={e => setPatientHeightCm(e.target.value)}
                  placeholder="e.g. 120" />
                <p className="text-[10px] text-slate-400 mt-0.5">{SCHWARTZ_INFO}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold mb-1.5 block">Upload Lab Report (image/PDF)</label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-green-400 transition-colors relative cursor-pointer">
                <input type="file" accept="image/*,.pdf" onChange={e => setLabFile(e.target.files[0])}
                  className="absolute inset-0 opacity-0 cursor-pointer" id="lab-upload" />
                <label htmlFor="lab-upload" className="cursor-pointer">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <p className="text-xs text-slate-600">{labFile ? labFile.name : 'Click to upload'}</p>
                </label>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold mb-1.5 block">Or Enter Lab Values</label>
              <Textarea value={labText} onChange={e => setLabText(e.target.value)} rows={6}
                placeholder={`Cr: 1.2 mg/dL\nBUN: 28 mg/dL\nK: 5.1 mEq/L\nNa: 138 mEq/L\nAlbumin: 2.4 g/dL\nCa: 8.6 mg/dL\nPO4: 5.2 mg/dL`} />
            </div>

            <Button onClick={handleAnalyze} disabled={(!labFile && !labText.trim()) || loading}
              className="w-full bg-green-600 hover:bg-green-700">
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing {labType}...</>
              ) : (
                <><TestTube className="w-4 h-4 mr-2" /> Analyze {labType}</>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── Results Tab ── */}
      {activeTab === 'results' && analysis && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-4 space-y-4">

            {/* Primary interpretation */}
            <div className="bg-white rounded-xl p-4 border-2 border-green-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-base">{labType} Interpretation</h3>
                {analysis.severity && <Badge className="bg-orange-600 text-white">{analysis.severity}</Badge>}
              </div>
              <p className="text-green-900 font-semibold">{analysis.primary_interpretation}</p>
              {analysis.ckd_stage && <Badge className="mt-2 mr-2 bg-blue-600 text-white">{analysis.ckd_stage}</Badge>}
              {analysis.aki_stage && <Badge className="mt-2 bg-red-600 text-white">{analysis.aki_stage}</Badge>}
            </div>

            {/* Extracted values with eGFR */}
            {analysis.extracted_values && (
              <div className="bg-white rounded-xl p-4">
                <h4 className="font-semibold text-sm mb-3 text-slate-800">Extracted Values</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {analysis.extracted_values.creatinine_mg_dL != null && (
                    <div className="bg-slate-50 rounded-lg p-2">
                      <p className="text-slate-500">Creatinine</p>
                      <p className="font-bold text-slate-800">{analysis.extracted_values.creatinine_mg_dL} mg/dL</p>
                    </div>
                  )}
                  {analysis.extracted_values.egfr_used != null && (
                    <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
                      <p className="text-blue-600">eGFR {analysis.extracted_values.egfr_source === 'schwartz_calculated' ? '(Schwartz)' : '(Reported)'}</p>
                      <p className="font-bold text-blue-800">{analysis.extracted_values.egfr_used.toFixed(1)} mL/min/1.73m²</p>
                    </div>
                  )}
                  {analysis.extracted_values.potassium_mEq_L != null && (
                    <div className={`rounded-lg p-2 ${analysis.extracted_values.potassium_mEq_L > 5.5 ? 'bg-red-50 border border-red-200' : 'bg-slate-50'}`}>
                      <p className="text-slate-500">Potassium</p>
                      <p className="font-bold">{analysis.extracted_values.potassium_mEq_L} mEq/L</p>
                    </div>
                  )}
                  {analysis.extracted_values.albumin_g_dL != null && (
                    <div className={`rounded-lg p-2 ${analysis.extracted_values.albumin_g_dL < 2.5 ? 'bg-orange-50 border border-orange-200' : 'bg-slate-50'}`}>
                      <p className="text-slate-500">Albumin</p>
                      <p className="font-bold">{analysis.extracted_values.albumin_g_dL} g/dL</p>
                    </div>
                  )}
                  {analysis.extracted_values.sodium_mEq_L != null && (
                    <div className="bg-slate-50 rounded-lg p-2">
                      <p className="text-slate-500">Sodium</p>
                      <p className="font-bold">{analysis.extracted_values.sodium_mEq_L} mEq/L</p>
                    </div>
                  )}
                  {analysis.extracted_values.phosphate_mg_dL != null && (
                    <div className="bg-slate-50 rounded-lg p-2">
                      <p className="text-slate-500">Phosphate</p>
                      <p className="font-bold">{analysis.extracted_values.phosphate_mg_dL} mg/dL</p>
                    </div>
                  )}
                </div>
                {analysis.extracted_values.egfr_source === 'schwartz_calculated' && analysis.calculations?.schwartz_workings && (
                  <div className="mt-2 bg-blue-50 rounded-lg p-2 border border-blue-100">
                    <p className="text-[10px] text-blue-700 font-mono">{analysis.calculations.schwartz_workings}</p>
                  </div>
                )}
              </div>
            )}

            {/* Critical values */}
            {analysis.critical_values?.length > 0 && (
              <div className="bg-red-50 rounded-xl p-3 border border-red-200">
                <h4 className="font-semibold text-sm mb-2 text-red-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Critical Values
                </h4>
                <ul className="space-y-1">
                  {analysis.critical_values.map((v, i) => <li key={i} className="text-xs text-red-800">⚠ {v}</li>)}
                </ul>
              </div>
            )}

            {/* Acid-base */}
            {(analysis.acid_base_disorder || analysis.compensation_status) && (
              <div className="bg-white rounded-xl p-3">
                <h4 className="font-semibold text-sm mb-2">Acid-Base Status</h4>
                {analysis.acid_base_disorder && <p className="text-sm text-slate-700 mb-1"><strong>Disorder:</strong> {analysis.acid_base_disorder}</p>}
                {analysis.compensation_status && <p className="text-sm text-slate-700"><strong>Compensation:</strong> {analysis.compensation_status}</p>}
                {analysis.calculations?.anion_gap && <p className="text-sm text-slate-700 mt-1"><strong>Anion Gap:</strong> {analysis.calculations.anion_gap}</p>}
              </div>
            )}

            {/* Abnormal findings */}
            {analysis.abnormal_findings?.length > 0 && (
              <div className="bg-white rounded-xl p-3">
                <h4 className="font-semibold text-sm mb-2">Abnormal Findings</h4>
                <ul className="space-y-1">{analysis.abnormal_findings.map((f, i) => <li key={i} className="text-xs text-slate-700">• {f}</li>)}</ul>
              </div>
            )}

            {/* Treatment */}
            {analysis.treatment_recommendations?.length > 0 && (
              <div className="bg-green-50 rounded-xl p-3 border border-green-200">
                <h4 className="font-semibold text-sm mb-2 text-green-900">Treatment Recommendations</h4>
                <ul className="space-y-1">{analysis.treatment_recommendations.map((r, i) => <li key={i} className="text-xs text-green-800">✓ {r}</li>)}</ul>
              </div>
            )}

            {/* Additional tests */}
            {analysis.additional_tests?.length > 0 && (
              <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                <h4 className="font-semibold text-sm mb-2 text-blue-900">Additional Tests</h4>
                <ul className="space-y-1">{analysis.additional_tests.map((t, i) => <li key={i} className="text-xs text-blue-800">→ {t}</li>)}</ul>
              </div>
            )}

            {/* TraceabilityLinker */}
            {(analysis.evidence_grade || analysis.guideline_ref || trace) && (
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <h4 className="font-semibold text-xs text-slate-600 mb-1.5">Evidence & Traceability</h4>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {(analysis.evidence_grade || trace?.evidence_grade) && (
                    <Badge variant="outline" className="text-[10px]">Grade {analysis.evidence_grade || trace.evidence_grade}</Badge>
                  )}
                  {(analysis.recommendation_strength || trace?.recommendation_strength) && (
                    <Badge variant="outline" className="text-[10px]">{analysis.recommendation_strength || trace.recommendation_strength}</Badge>
                  )}
                  {(analysis.guideline_ref || trace?.guideline_name) && (
                    <span className="text-slate-500 text-[10px] self-center">{analysis.guideline_ref || trace.guideline_name}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          <Button variant="outline" size="sm" className="w-full" onClick={() => setActiveTab('analyze')}>
            Analyze Another Report
          </Button>
        </div>
      )}

      {/* ── Reference Tab ── */}
      {activeTab === 'reference' && (
        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
            <p className="text-xs font-bold text-blue-800 mb-2">Paediatric Renal Reference Ranges</p>
            <div className="space-y-1.5 text-xs">
              {[
                ['Creatinine', '0.3–0.7 mg/dL (age-dependent)'],
                ['eGFR', '>90 mL/min/1.73m² (normal)'],
                ['Potassium', '3.5–5.0 mEq/L'],
                ['Sodium', '136–145 mEq/L'],
                ['Calcium', '8.8–10.8 mg/dL'],
                ['Phosphate', '4.5–6.5 mg/dL (children)'],
                ['Albumin', '3.5–5.0 g/dL'],
                ['BUN', '5–20 mg/dL'],
              ].map(([param, range]) => (
                <div key={param} className="flex justify-between">
                  <span className="font-semibold text-slate-700">{param}</span>
                  <span className="text-slate-600">{range}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
            <p className="text-xs font-bold text-purple-800 mb-2">Schwartz GFR Formula</p>
            <p className="text-xs font-mono bg-white rounded p-2 border">eGFR = (0.413 × height_cm) / Cr_mg/dL</p>
            <p className="text-[10px] text-purple-700 mt-1">ISPN validated for children. Height required. Cr in mg/dL.</p>
            <p className="text-[10px] text-purple-600 mt-0.5">Ref: Schwartz GJ et al. JASN 2009; PMID 19158358</p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-xs font-bold text-amber-800 mb-2">CKD Staging (KDIGO 2012)</p>
            <div className="space-y-1 text-[11px]">
              {[['G1', '≥90', 'Normal or high'], ['G2', '60–89', 'Mildly decreased'], ['G3a', '45–59', 'Mild–mod decreased'], ['G3b', '30–44', 'Mod–severely decreased'], ['G4', '15–29', 'Severely decreased'], ['G5', '<15', 'Kidney failure']].map(([g, egfr, desc]) => (
                <div key={g} className="flex gap-2">
                  <span className="font-bold text-amber-800 w-6">{g}</span>
                  <span className="text-amber-700 w-16">{egfr}</span>
                  <span className="text-amber-600">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
