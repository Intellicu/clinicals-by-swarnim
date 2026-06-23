import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Copy, Printer, Check } from "lucide-react";
import { toast } from "sonner";

export default function ReportActions({ title = "Analysis Report", result, summary = "", printId }) {
  const [copied, setCopied] = useState(false);

  function handlePrint() {
    const html = buildPrintHTML(title, result, summary);
    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 400);
  }

  function handleCopy() {
    const lines = [
      `=== ${title} ===`,
      `Generated: ${new Date().toLocaleString()}`,
      `Powered by ClinicalHub — For clinical use only`,
      "",
      summary || buildTextSummary(result),
      "",
      "--- Disclaimer ---",
      "This is a clinical decision-support tool. Clinical correlation required.",
    ];
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      toast.success("Report copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => toast.error("Could not copy — please try manually"));
  }

  function handleDownload() {
    if (!result) return;
    const payload = {
      title,
      generated_at: new Date().toISOString(),
      source: "ClinicalHub",
      data: result,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "_")}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded");
  }

  return (
    <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-200 mt-2">
      <span className="text-xs text-slate-400 mr-auto">Save or share this report</span>
      <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={handleCopy}>
        {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? "Copied" : "Copy"}
      </Button>
      <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={handlePrint}>
        <Printer className="w-3.5 h-3.5" />
        Save PDF
      </Button>
      {result && (
        <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={handleDownload}>
          <Download className="w-3.5 h-3.5" />
          JSON
        </Button>
      )}
    </div>
  );
}

// ── Full HTML report builder ─────────────────────────────────────────────────
function buildPrintHTML(title, result, summary) {
  const ts = new Date().toLocaleString();
  const css = `
    body { font-family: Arial, sans-serif; font-size: 12px; color: #1a1a1a; margin: 0; padding: 24px; }
    h1 { font-size: 18px; color: #1e3a5f; border-bottom: 2px solid #1e3a5f; padding-bottom: 6px; margin-bottom: 4px; }
    .meta { color: #666; font-size: 10px; margin-bottom: 20px; }
    h2 { font-size: 13px; color: #1e3a5f; margin: 16px 0 6px; border-left: 3px solid #3b82f6; padding-left: 8px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; margin: 2px; }
    .badge-red { background: #fee2e2; color: #991b1b; }
    .badge-orange { background: #ffedd5; color: #9a3412; }
    .badge-yellow { background: #fef9c3; color: #854d0e; }
    .badge-green { background: #dcfce7; color: #166534; }
    .badge-blue { background: #dbeafe; color: #1e40af; }
    .badge-purple { background: #ede9fe; color: #5b21b6; }
    .badge-gray { background: #f1f5f9; color: #334155; }
    .row { display: flex; gap: 12px; margin-bottom: 4px; }
    .label { font-weight: bold; min-width: 160px; color: #374151; }
    .value { color: #1f2937; }
    ul { margin: 4px 0 8px 0; padding-left: 18px; }
    li { margin-bottom: 2px; }
    .warn { background: #fff7ed; border: 1px solid #fb923c; border-radius: 4px; padding: 8px 12px; margin: 12px 0; }
    .info { background: #eff6ff; border: 1px solid #93c5fd; border-radius: 4px; padding: 8px 12px; margin: 12px 0; }
    .disclaimer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #6b7280; }
    @media print { body { padding: 12px; } }
  `;

  let body = "";

  if (!result) {
    body = `<p>${summary || "No analysis data available."}</p>`;
  } else if (result.primary_diagnosis !== undefined && result.primary_interpretation === undefined) {
    // ── Biopsy report
    body += renderBadgeRow("Diagnosis", result.primary_diagnosis, acmgColor(result.histology_class));
    body += renderBadgeRow("Histology Class", result.histology_class, "badge-blue");
    body += renderBadgeRow("Confidence", result.confidence_level, "badge-gray");
    body += renderBadgeRow("Severity Grade", result.severity_grade, severityColor(result.severity_grade));
    body += renderBadgeRow("Evidence Grade", result.evidence_grade, "badge-purple");
    body += renderBadgeRow("Guideline", result.guideline_ref, "badge-gray");
    body += renderBadgeRow("Recommendation Strength", result.recommendation_strength, "badge-gray");
    if (result.prognosis) body += `<h2>Prognosis</h2><p>${result.prognosis}</p>`;
    body += renderList("Glomerular Findings", result.glomerular_findings);
    body += renderList("Tubular Findings", result.tubular_findings);
    body += renderList("Interstitial Findings", result.interstitial_findings);
    body += renderList("Vascular Findings", result.vascular_findings);
    if (result.immunofluorescence) body += `<h2>Immunofluorescence</h2><p>${result.immunofluorescence}</p>`;
    if (result.electron_microscopy) body += `<h2>Electron Microscopy</h2><p>${result.electron_microscopy}</p>`;
    body += renderList("Differential Diagnoses", result.differential_diagnoses);
    body += renderList("Treatment Recommendations", result.treatment_recommendations);
    body += renderList("Key References", result.key_references);
  } else if (result.primary_interpretation !== undefined) {
    // ── Lab report
    body += `<h2>Interpretation</h2><p>${result.primary_interpretation}</p>`;
    body += renderBadgeRow("CKD Stage", result.ckd_stage, severityColor(result.ckd_stage));
    body += renderBadgeRow("AKI Stage", result.aki_stage, severityColor(result.aki_stage));
    body += renderBadgeRow("Severity", result.severity, severityColor(result.severity));
    body += renderBadgeRow("Evidence Grade", result.evidence_grade, "badge-purple");
    body += renderBadgeRow("Guideline", result.guideline_ref, "badge-gray");
    body += renderBadgeRow("Recommendation Strength", result.recommendation_strength, "badge-gray");
    const ev = result.extracted_values;
    if (ev) {
      body += `<h2>Extracted Lab Values</h2>`;
      const labFields = [
        ["Creatinine", ev.creatinine_mg_dL, "mg/dL"],
        ["BUN", ev.bun_mg_dL, "mg/dL"],
        ["eGFR (reported)", ev.egfr_reported, "mL/min/1.73m²"],
        ["eGFR (Schwartz)", ev.egfr_schwartz, "mL/min/1.73m²"],
        ["eGFR used", ev.egfr_used, `mL/min/1.73m² (${ev.egfr_source || ""})`],
        ["Sodium", ev.sodium_mEq_L, "mEq/L"],
        ["Potassium", ev.potassium_mEq_L, "mEq/L"],
        ["Calcium", ev.calcium_mg_dL, "mg/dL"],
        ["Phosphate", ev.phosphate_mg_dL, "mg/dL"],
        ["Albumin", ev.albumin_g_dL, "g/dL"],
        ["Haemoglobin", ev.haemoglobin_g_dL, "g/dL"],
      ];
      body += `<ul>${labFields.filter(f => f[1] != null).map(f => `<li><b>${f[0]}:</b> ${f[1]} ${f[2]}</li>`).join("")}</ul>`;
    }
    if (result.acid_base_disorder) body += renderBadgeRow("Acid-Base Disorder", result.acid_base_disorder, "badge-orange");
    if (result.compensation_status) body += renderBadgeRow("Compensation", result.compensation_status, "badge-gray");
    body += renderList("Critical Values", result.critical_values, true);
    body += renderList("Abnormal Findings", result.abnormal_findings);
    body += renderList("Differential Diagnosis", result.differential_diagnosis);
    body += renderList("Treatment Recommendations", result.treatment_recommendations);
    body += renderList("Additional Tests", result.additional_tests);
    body += renderList("Clinical Pearls", result.clinical_pearls);
  } else if (result.acmg_class !== undefined) {
    // ── Genetics report
    body += renderBadgeRow("ACMG Classification", result.acmg_class, acmgColor(result.acmg_class));
    body += renderBadgeRow("Gene", result.gene_identified, "badge-purple");
    body += renderBadgeRow("Variant (HGVS)", result.variant_hgvs, "badge-gray");
    body += renderBadgeRow("Variant Type", result.variant_type, "badge-gray");
    body += renderBadgeRow("Zygosity", result.zygosity, "badge-blue");
    body += renderBadgeRow("Inheritance", result.inheritance_pattern, "badge-gray");
    body += renderBadgeRow("Evidence Grade", result.evidence_grade, "badge-purple");
    body += renderBadgeRow("Guideline", result.guideline_ref, "badge-gray");
    if (result.acmg_classification_rationale) body += `<h2>Classification Rationale</h2><p>${result.acmg_classification_rationale}</p>`;
    if (result.pathogenic_evidence?.length) body += `<h2>Pathogenic Evidence Criteria</h2><p>${result.pathogenic_evidence.map(c => `<span class="badge badge-red">${c}</span>`).join(" ")}</p>`;
    if (result.benign_evidence?.length) body += `<h2>Benign Evidence Criteria</h2><p>${result.benign_evidence.map(c => `<span class="badge badge-blue">${c}</span>`).join(" ")}</p>`;
    if (result.prescription_suppressor_triggered) body += `<div class="warn"><b>⚠ CNI CONTRAINDICATED</b> — Prescription Suppressor Activated (ISPN 2021 §3.5, Grade 2C)<br>${result.suppression_reason || ""}</div>`;
    if (result.disease_association) body += `<h2>Disease Association</h2><p>${result.disease_association}</p>`;
    if (result.clinical_significance) body += `<h2>Clinical Significance</h2><p>${result.clinical_significance}</p>`;
    if (result.population_frequency_note) body += `<h2>Population Frequency</h2><p>${result.population_frequency_note}</p>`;
    body += renderList("Management Implications", result.management_implications);
    body += renderList("Counselling Points", result.counseling_points);
    body += renderList("Next Steps", result.next_steps);
    if (result.family_testing_recommended) body += `<div class="info"><b>Family Testing Recommended</b> — ${result.family_testing_rationale || ""}</div>`;
  } else if (result.most_likely_diagnosis !== undefined) {
    // ── Case report
    body += renderBadgeRow("Most Likely Diagnosis", result.most_likely_diagnosis, "badge-blue");
    body += renderBadgeRow("Confidence", result.confidence_level, "badge-gray");
    if (result.case_summary) body += `<h2>Case Summary</h2><p>${result.case_summary}</p>`;
    if (result.pathophysiology) body += `<h2>Pathophysiology</h2><p>${result.pathophysiology}</p>`;
    body += renderList("Problem List", result.problem_list);
    if (result.differential_diagnoses?.length) {
      body += `<h2>Differential Diagnoses</h2><ul>${result.differential_diagnoses.map(d =>
        `<li><b>${d.diagnosis}</b> (${d.probability}) — ${d.reasoning}</li>`).join("")}</ul>`;
    }
    const mp = result.management_plan;
    if (mp) {
      body += renderList("Immediate Management", mp.immediate);
      body += renderList("Short-Term Management", mp.short_term);
      body += renderList("Long-Term Management", mp.long_term);
    }
    body += renderList("Red Flags", result.red_flags);
    body += renderList("Additional Investigations", result.additional_investigations);
    body += renderList("Counselling Points", result.counseling_points);
    if (result.prognosis) body += `<h2>Prognosis</h2><p>${result.prognosis}</p>`;
    if (result.follow_up_plan) body += `<h2>Follow-Up Plan</h2><p>${result.follow_up_plan}</p>`;
    body += renderList("Guidelines Applied", result.guidelines_applied);
    if (result.traceability_links?.length) {
      body += `<h2>Evidence Traceability</h2><ul>${result.traceability_links.map(t =>
        `<li><b>${t.recommendation}</b> — ${t.guideline} ${t.section || ""} [${t.evidence_grade || ""}] (${t.recommendation_strength || ""})</li>`).join("")}</ul>`;
    }
  } else {
    body += `<p>${summary}</p>`;
  }

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>${css}</style></head><body>
    <h1>${title}</h1>
    <p class="meta">Generated: ${ts} &nbsp;·&nbsp; ClinicalHub — For clinical use only</p>
    ${body}
    <div class="disclaimer">⚠ This report is generated by an AI clinical decision-support tool. All findings must be verified by a qualified clinician before any clinical action is taken. Not a substitute for professional medical judgement.</div>
  </body></html>`;
}

function renderBadgeRow(label, value, badgeClass = "badge-gray") {
  if (!value) return "";
  return `<div class="row"><span class="label">${label}:</span><span class="badge ${badgeClass}">${value}</span></div>`;
}

function renderList(label, arr, warn = false) {
  if (!arr?.length) return "";
  const cls = warn ? "warn" : "";
  return `<h2>${label}</h2><ul class="${cls}">${arr.map(i => `<li>${i}</li>`).join("")}</ul>`;
}

function acmgColor(val) {
  if (!val) return "badge-gray";
  const v = val.toLowerCase();
  if (v.includes("pathogenic") && !v.includes("likely")) return "badge-red";
  if (v.includes("likely pathogenic")) return "badge-orange";
  if (v.includes("vus") || v.includes("uncertain")) return "badge-yellow";
  if (v.includes("likely benign")) return "badge-blue";
  if (v.includes("benign")) return "badge-green";
  return "badge-blue";
}

function severityColor(val) {
  if (!val) return "badge-gray";
  const v = val.toLowerCase();
  if (v.includes("critical") || v.includes("severe") || v.includes("stage 5") || v.includes("g5")) return "badge-red";
  if (v.includes("moderate") || v.includes("stage 3") || v.includes("stage 4") || v.includes("g3") || v.includes("g4")) return "badge-orange";
  if (v.includes("mild") || v.includes("stage 2") || v.includes("g2")) return "badge-yellow";
  return "badge-gray";
}

function buildTextSummary(result) {
  if (!result) return "";
  const lines = [];
  if (result.acmg_class) {
    lines.push(`ACMG Classification: ${result.acmg_class}`);
    if (result.gene_identified) lines.push(`Gene: ${result.gene_identified}`);
    if (result.variant_hgvs) lines.push(`Variant: ${result.variant_hgvs}`);
    if (result.zygosity) lines.push(`Zygosity: ${result.zygosity}`);
    if (result.acmg_classification_rationale) lines.push(`Rationale: ${result.acmg_classification_rationale}`);
    if (result.prescription_suppressor_triggered) lines.push("⚠ CNI CONTRAINDICATED — Prescription Suppressor Activated");
    if (result.management_implications?.length) lines.push("Management: " + result.management_implications.join("; "));
  }
  if (result.primary_interpretation) {
    lines.push(`Interpretation: ${result.primary_interpretation}`);
    if (result.ckd_stage) lines.push(`CKD Stage: ${result.ckd_stage}`);
    if (result.aki_stage) lines.push(`AKI Stage: ${result.aki_stage}`);
    const ev = result.extracted_values;
    if (ev?.creatinine_mg_dL) lines.push(`Creatinine: ${ev.creatinine_mg_dL} mg/dL`);
    if (ev?.egfr_used) lines.push(`eGFR: ${ev.egfr_used.toFixed(1)} mL/min/1.73m²`);
    if (result.critical_values?.length) lines.push("Critical: " + result.critical_values.join("; "));
    if (result.treatment_recommendations?.length) lines.push("Treatment: " + result.treatment_recommendations.join("; "));
  }
  if (result.primary_diagnosis && !result.primary_interpretation) {
    lines.push(`Diagnosis: ${result.primary_diagnosis}`);
    if (result.histology_class) lines.push(`Histology: ${result.histology_class}`);
    if (result.severity_grade) lines.push(`Severity: ${result.severity_grade}`);
    if (result.prognosis) lines.push(`Prognosis: ${result.prognosis}`);
    if (result.treatment_recommendations?.length) lines.push("Treatment: " + result.treatment_recommendations.join("; "));
  }
  if (result.evidence_grade) lines.push(`Evidence Grade: ${result.evidence_grade}`);
  if (result.guideline_ref) lines.push(`Guideline: ${result.guideline_ref}`);
  return lines.join("\n");
}