import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Download, Printer } from 'lucide-react';

function buildTextSummary(result) {
  if (!result) return '';
  const lines = [];
  if (result.acmg_class) {
    lines.push(`ACMG Classification: ${result.acmg_class}`);
    if (result.gene_identified) lines.push(`Gene: ${result.gene_identified}`);
    if (result.variant_hgvs) lines.push(`Variant: ${result.variant_hgvs}`);
    if (result.acmg_classification_rationale) lines.push(`Rationale: ${result.acmg_classification_rationale}`);
    if (result.prescription_suppressor_triggered) lines.push('⚠ CNI CONTRAINDICATED — Genetic SRNS');
    if (result.management_implications?.length) lines.push('Management: ' + result.management_implications.join('; '));
  } else if (result.primary_interpretation) {
    lines.push(`Interpretation: ${result.primary_interpretation}`);
    if (result.ckd_stage) lines.push(`CKD Stage: ${result.ckd_stage}`);
    if (result.aki_stage) lines.push(`AKI Stage: ${result.aki_stage}`);
    if (result.critical_values?.length) lines.push('Critical: ' + result.critical_values.join('; '));
    if (result.treatment_recommendations?.length) lines.push('Treatment: ' + result.treatment_recommendations.join('; '));
  } else if (result.primary_diagnosis) {
    lines.push(`Diagnosis: ${result.primary_diagnosis}`);
    if (result.histology_class) lines.push(`Class: ${result.histology_class}`);
    if (result.severity_grade) lines.push(`Severity: ${result.severity_grade}`);
    if (result.prognosis) lines.push(`Prognosis: ${result.prognosis}`);
    if (result.treatment_recommendations?.length) lines.push('Treatment: ' + result.treatment_recommendations.join('; '));
  }
  if (result.evidence_grade) lines.push(`Evidence Grade: ${result.evidence_grade}`);
  if (result.guideline_ref) lines.push(`Guideline: ${result.guideline_ref}`);
  return lines.join('\n');
}

export default function ReportActions({ title = 'Clinical Report', result, summary, printId }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = summary || buildTextSummary(result);
    try {
      await navigator.clipboard.writeText(`${title}\n${'='.repeat(title.length)}\n${text}\n\nGenerated: ${new Date().toLocaleString()}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handlePrint = () => {
    const text = summary || buildTextSummary(result);
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>${title}</title><style>body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;padding:20px;color:#1e293b}h1{color:#1e40af;border-bottom:2px solid #1e40af;padding-bottom:8px}pre{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;white-space:pre-wrap;font-size:13px}footer{margin-top:32px;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:8px}@media print{body{margin:0}}</style></head><body><h1>${title}</h1><pre>${text}</pre><footer>Generated: ${new Date().toLocaleString()} · CliniCals Hub — For clinical use only</footer></body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 300);
  };

  const handleDownload = () => {
    if (!result) return;
    const payload = { title, generated_at: new Date().toISOString(), source: 'CliniCals Hub AI', data: result };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-200 mt-2">
      <span className="text-xs text-slate-400 mr-auto">Save or share this report</span>
      <Button variant="outline" size="sm" onClick={handleCopy} className="text-xs h-8 gap-1.5">
        <Copy className="w-3.5 h-3.5" />{copied ? 'Copied!' : 'Copy'}
      </Button>
      <Button variant="outline" size="sm" onClick={handlePrint} className="text-xs h-8 gap-1.5">
        <Printer className="w-3.5 h-3.5" />Save PDF
      </Button>
      {result && (
        <Button variant="outline" size="sm" onClick={handleDownload} className="text-xs h-8 gap-1.5">
          <Download className="w-3.5 h-3.5" />JSON
        </Button>
      )}
    </div>
  );
}
