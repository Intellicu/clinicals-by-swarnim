import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Printer, Check } from "lucide-react";
import { toast } from "sonner";
import PDFExportButton from "@/components/export/PDFExportButton";
import SaveToDriveButton from "@/components/export/SaveToDriveButton";
import LetterheadSettingsDialog from "@/components/reports/LetterheadSettingsDialog";
import { getLetterhead } from "@/lib/reports/letterhead";

export default function ReportActions({ title = "Analysis Report", result, summary = "" }) {
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
    const body = buildTextSummary(result) || summary;
    const lines = [
      `=== ${title} ===`,
      `Generated: ${new Date().toLocaleString()}`,
      `ClinicalHub — For clinical use only`,
      "",
      body,
      "",
      "--- Disclaimer ---",
      "Clinical decision-support only. Verify with a qualified clinician before any clinical action.",
    ];
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      toast.success("Report copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => toast.error("Could not copy — please try manually"));
  }

  return (
    <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-200 mt-2">
      <span className="text-xs text-slate-400 mr-auto">Save or share this report</span>
      <LetterheadSettingsDialog />
      <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={handleCopy}>
        {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? "Copied" : "Copy"}
      </Button>
      <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={handlePrint}>
        <Printer className="w-3.5 h-3.5" />
        Print
      </Button>
      <PDFExportButton
        title={title}
        subtitle="Clinical analysis report"
        filename={`${title.replace(/\s+/g, "_")}.pdf`}
        sections={[{ heading: null, lines: (buildTextSummary(result) || summary || "No analysis data.").split("\n") }]}
      />
      <SaveToDriveButton
        title={title}
        subtitle="Clinical analysis report"
        filename={`${title.replace(/\s+/g, "_")}.pdf`}
        sections={[{ heading: null, lines: (buildTextSummary(result) || summary || "No analysis data.").split("\n") }]}
      />
    </div>
  );
}

function buildPrintHTML(title, result, summary) {
  const ts = new Date().toLocaleString();
  const lh = getLetterhead();
  const lhHtml = (lh.clinic_name || lh.doctor_name) ? `
    <div style="text-align:center;border-bottom:3px double #1e3a5f;padding-bottom:10px;margin-bottom:14px">
      ${lh.clinic_name ? `<div style="font-size:20px;font-weight:bold;color:#1e3a5f">${lh.clinic_name}</div>` : ""}
      ${lh.doctor_name ? `<div style="font-size:12px;font-weight:bold;margin-top:2px">${lh.doctor_name}${lh.qualifications ? ", " + lh.qualifications : ""}${lh.reg_number ? " · Reg. No. " + lh.reg_number : ""}</div>` : ""}
      ${[lh.address, lh.phone, lh.email].filter(Boolean).length ? `<div style="font-size:10px;color:#555;margin-top:2px">${[lh.address, lh.phone, lh.email].filter(Boolean).join(" · ")}</div>` : ""}
    </div>` : "";
  const css = `
    body{font-family:Arial,sans-serif;font-size:12px;color:#1a1a1a;margin:0;padding:24px}
    h1{font-size:18px;color:#1e3a5f;border-bottom:2px solid #1e3a5f;padding-bottom:6px;margin-bottom:4px}
    .meta{color:#666;font-size:10px;margin-bottom:20px}
    h2{font-size:13px;color:#1e3a5f;margin:16px 0 6px;border-left:3px solid #3b82f6;padding-left:8px}
    .badge{display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:bold;margin:2px}
    .r{background:#fee2e2;color:#991b1b}.o{background:#ffedd5;color:#9a3412}.y{background:#fef9c3;color:#854d0e}
    .g{background:#dcfce7;color:#166534}.b{background:#dbeafe;color:#1e40af}.p{background:#ede9fe;color:#5b21b6}.gr{background:#f1f5f9;color:#334155}
    .row{display:flex;gap:12px;margin-bottom:4px}.label{font-weight:bold;min-width:160px;color:#374151}
    ul{margin:4px 0 8px;padding-left:18px}li{margin-bottom:2px}
    .warn{background:#fff7ed;border:1px solid #fb923c;border-radius:4px;padding:8px 12px;margin:12px 0}
    .info{background:#eff6ff;border:1px solid #93c5fd;border-radius:4px;padding:8px 12px;margin:12px 0}
    .disc{margin-top:24px;padding-top:12px;border-top:1px solid #e2e8f0;font-size:10px;color:#6b7280}
    @media print{body{padding:12px}}
  `;
  let body = "";
  if (!result) {
    body = `<p>${summary || "No analysis data."}</p>`;
  } else if (result.primary_diagnosis !== undefined && result.primary_interpretation === undefined) {
    body += row("Diagnosis", result.primary_diagnosis, "b") + row("Histology Class", result.histology_class, "b") + row("Confidence", result.confidence_level, "gr") + row("Severity", result.severity_grade, sev(result.severity_grade)) + row("Evidence Grade", result.evidence_grade, "p") + row("Guideline", result.guideline_ref, "gr") + row("Recommendation", result.recommendation_strength, "gr");
    if (result.prognosis) body += `<h2>Prognosis</h2><p>${result.prognosis}</p>`;
    body += lst("Glomerular Findings", result.glomerular_findings) + lst("Tubular Findings", result.tubular_findings) + lst("Interstitial Findings", result.interstitial_findings) + lst("Vascular Findings", result.vascular_findings);
    if (result.immunofluorescence) body += `<h2>Immunofluorescence</h2><p>${result.immunofluorescence}</p>`;
    if (result.electron_microscopy) body += `<h2>Electron Microscopy</h2><p>${result.electron_microscopy}</p>`;
    body += lst("Differential Diagnoses", result.differential_diagnoses) + lst("Treatment Recommendations", result.treatment_recommendations) + lst("Key References", result.key_references);
  } else if (result.primary_interpretation !== undefined) {
    body += `<h2>Interpretation</h2><p>${result.primary_interpretation}</p>`;
    body += row("CKD Stage", result.ckd_stage, sev(result.ckd_stage)) + row("AKI Stage", result.aki_stage, sev(result.aki_stage)) + row("Severity", result.severity, sev(result.severity)) + row("Acid-Base", result.acid_base_disorder, "o") + row("Compensation", result.compensation_status, "gr") + row("Evidence Grade", result.evidence_grade, "p") + row("Guideline", result.guideline_ref, "gr");
    const ev = result.extracted_values;
    if (ev) {
      body += `<h2>Extracted Lab Values</h2><ul>`;
      [["Creatinine",ev.creatinine_mg_dL,"mg/dL"],["BUN",ev.bun_mg_dL,"mg/dL"],["eGFR reported",ev.egfr_reported,"mL/min/1.73m²"],["eGFR Schwartz",ev.egfr_schwartz,"mL/min/1.73m²"],["eGFR used",ev.egfr_used,`mL/min/1.73m² (${ev.egfr_source||""})`],["Sodium",ev.sodium_mEq_L,"mEq/L"],["Potassium",ev.potassium_mEq_L,"mEq/L"],["Calcium",ev.calcium_mg_dL,"mg/dL"],["Phosphate",ev.phosphate_mg_dL,"mg/dL"],["Albumin",ev.albumin_g_dL,"g/dL"],["Haemoglobin",ev.haemoglobin_g_dL,"g/dL"]].filter(f=>f[1]!=null).forEach(f=>{ body+=`<li><b>${f[0]}:</b> ${f[1]} ${f[2]}</li>`; });
      body += "</ul>";
    }
    body += lst("Critical Values", result.critical_values) + lst("Abnormal Findings", result.abnormal_findings) + lst("Differential Diagnosis", result.differential_diagnosis) + lst("Treatment Recommendations", result.treatment_recommendations) + lst("Additional Tests", result.additional_tests) + lst("Clinical Pearls", result.clinical_pearls);
  } else if (result.acmg_class !== undefined) {
    body += row("ACMG Class", result.acmg_class, acmgC(result.acmg_class)) + row("Gene", result.gene_identified, "p") + row("Variant (HGVS)", result.variant_hgvs, "gr") + row("Variant Type", result.variant_type, "gr") + row("Zygosity", result.zygosity, "b") + row("Inheritance", result.inheritance_pattern, "gr") + row("Evidence Grade", result.evidence_grade, "p") + row("Guideline", result.guideline_ref, "gr");
    if (result.acmg_classification_rationale) body += `<h2>Classification Rationale</h2><p>${result.acmg_classification_rationale}</p>`;
    if (result.pathogenic_evidence?.length) body += `<h2>Pathogenic Criteria</h2><p>${result.pathogenic_evidence.map(c=>`<span class="badge r">${c}</span>`).join(" ")}</p>`;
    if (result.benign_evidence?.length) body += `<h2>Benign Criteria</h2><p>${result.benign_evidence.map(c=>`<span class="badge b">${c}</span>`).join(" ")}</p>`;
    if (result.prescription_suppressor_triggered) body += `<div class="warn"><b>⚠ CNI CONTRAINDICATED</b> — Prescription Suppressor Activated (ISPN 2021, 3.5, Grade 2C)<br>${result.suppression_reason||""}</div>`;
    if (result.disease_association) body += `<h2>Disease Association</h2><p>${result.disease_association}</p>`;
    if (result.clinical_significance) body += `<h2>Clinical Significance</h2><p>${result.clinical_significance}</p>`;
    if (result.population_frequency_note) body += `<h2>Population Frequency</h2><p>${result.population_frequency_note}</p>`;
    body += lst("Management Implications", result.management_implications) + lst("Counselling Points", result.counseling_points) + lst("Next Steps", result.next_steps);
    if (result.family_testing_recommended) body += `<div class="info"><b>Family Testing Recommended</b> — ${result.family_testing_rationale||""}</div>`;
  } else if (result.most_likely_diagnosis !== undefined) {
    body += row("Most Likely Diagnosis", result.most_likely_diagnosis, "b") + row("Confidence", result.confidence_level, "gr");
    if (result.case_summary) body += `<h2>Case Summary</h2><p>${result.case_summary}</p>`;
    if (result.pathophysiology) body += `<h2>Pathophysiology</h2><p>${result.pathophysiology}</p>`;
    body += lst("Problem List", result.problem_list);
    if (result.differential_diagnoses?.length) body += `<h2>Differential Diagnoses</h2><ul>${result.differential_diagnoses.map(d=>`<li><b>${d.diagnosis}</b> (${d.probability}) — ${d.reasoning}</li>`).join("")}</ul>`;
    const mp = result.management_plan;
    if (mp) body += lst("Immediate Management", mp.immediate) + lst("Short-Term Management", mp.short_term) + lst("Long-Term Management", mp.long_term);
    body += lst("Red Flags", result.red_flags) + lst("Additional Investigations", result.additional_investigations) + lst("Counselling Points", result.counseling_points);
    if (result.prognosis) body += `<h2>Prognosis</h2><p>${result.prognosis}</p>`;
    if (result.follow_up_plan) body += `<h2>Follow-Up Plan</h2><p>${result.follow_up_plan}</p>`;
    body += lst("Guidelines Applied", result.guidelines_applied);
    if (result.traceability_links?.length) body += `<h2>Evidence Traceability</h2><ul>${result.traceability_links.map(t=>`<li><b>${t.recommendation}</b> — ${t.guideline} ${t.section||""} [${t.evidence_grade||""}] (${t.recommendation_strength||""})</li>`).join("")}</ul>`;
  } else { body = `<p>${summary}</p>`; }

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>${css}</style></head><body>${lhHtml}<h1>${title}</h1><p class="meta">Generated: ${ts} · ClinicalHub — For clinical use only</p>${body}<div class="disc">${lh.footer_note ? lh.footer_note + "<br>" : ""}⚠ AI clinical decision-support. Verify with a qualified clinician before any clinical action.</div></body></html>`;
}

function row(label, value, cls="gr") { if(!value) return ""; return `<div class="row"><span class="label">${label}:</span><span class="badge ${cls}">${value}</span></div>`; }
function lst(label, arr) { if(!arr?.length) return ""; return `<h2>${label}</h2><ul>${arr.map(i=>`<li>${i}</li>`).join("")}</ul>`; }
function acmgC(v="") { const l=v.toLowerCase(); if(l.includes("pathogenic")&&!l.includes("likely")) return "r"; if(l.includes("likely pathogenic")) return "o"; if(l.includes("vus")||l.includes("uncertain")) return "y"; if(l.includes("likely benign")) return "b"; if(l.includes("benign")) return "g"; return "b"; }
function sev(v="") { const l=v.toLowerCase(); if(l.includes("critical")||l.includes("severe")||l.match(/stage [45]|g[45]/)) return "r"; if(l.includes("moderate")||l.match(/stage [34]|g[34]/)) return "o"; if(l.includes("mild")||l.match(/stage [12]|g[12]/)) return "y"; return "gr"; }

function buildTextSummary(result) {
  if (!result) return "";
  const lines = [];
  const add = (label, val) => val && lines.push(`${label}: ${val}`);
  const addList = (label, arr) => arr?.length && lines.push(`${label}:\n${arr.map(i => `  • ${i}`).join("\n")}`);

  if (result.acmg_class !== undefined) {
    add("ACMG Classification", result.acmg_class); add("Gene", result.gene_identified); add("Variant", result.variant_hgvs);
    add("Zygosity", result.zygosity); add("Inheritance", result.inheritance_pattern); add("Variant Type", result.variant_type);
    add("Rationale", result.acmg_classification_rationale);
    result.pathogenic_evidence?.length && lines.push(`Pathogenic Criteria: ${result.pathogenic_evidence.join(", ")}`);
    result.benign_evidence?.length && lines.push(`Benign Criteria: ${result.benign_evidence.join(", ")}`);
    result.prescription_suppressor_triggered && lines.push("⚠ CNI CONTRAINDICATED — Prescription Suppressor Activated");
    add("Disease Association", result.disease_association); add("Clinical Significance", result.clinical_significance);
    add("Population Frequency", result.population_frequency_note);
    addList("Management Implications", result.management_implications); addList("Counselling Points", result.counseling_points); addList("Next Steps", result.next_steps);
    result.family_testing_recommended && lines.push(`Family Testing Recommended: ${result.family_testing_rationale || "Yes"}`);
  } else if (result.primary_interpretation !== undefined) {
    add("Interpretation", result.primary_interpretation); add("CKD Stage", result.ckd_stage); add("AKI Stage", result.aki_stage);
    add("Severity", result.severity); add("Acid-Base Disorder", result.acid_base_disorder); add("Compensation", result.compensation_status);
    const ev = result.extracted_values;
    if (ev) {
      [["Creatinine",ev.creatinine_mg_dL,"mg/dL"],["BUN",ev.bun_mg_dL,"mg/dL"],["eGFR used",ev.egfr_used,`mL/min/1.73m² (${ev.egfr_source||""})`],["Sodium",ev.sodium_mEq_L,"mEq/L"],["Potassium",ev.potassium_mEq_L,"mEq/L"],["Calcium",ev.calcium_mg_dL,"mg/dL"],["Phosphate",ev.phosphate_mg_dL,"mg/dL"],["Albumin",ev.albumin_g_dL,"g/dL"],["Haemoglobin",ev.haemoglobin_g_dL,"g/dL"]].filter(f=>f[1]!=null).forEach(f=>lines.push(`${f[0]}: ${f[1]} ${f[2]}`));
    }
    addList("Critical Values", result.critical_values); addList("Abnormal Findings", result.abnormal_findings);
    addList("Differential Diagnosis", result.differential_diagnosis); addList("Treatment Recommendations", result.treatment_recommendations);
    addList("Additional Tests", result.additional_tests); addList("Clinical Pearls", result.clinical_pearls);
  } else if (result.primary_diagnosis !== undefined) {
    add("Diagnosis", result.primary_diagnosis); add("Histology Class", result.histology_class); add("Confidence", result.confidence_level);
    add("Severity Grade", result.severity_grade); add("Prognosis", result.prognosis);
    if (result.immunofluorescence) add("Immunofluorescence", result.immunofluorescence);
    if (result.electron_microscopy) add("Electron Microscopy", result.electron_microscopy);
    addList("Glomerular Findings", result.glomerular_findings); addList("Tubular Findings", result.tubular_findings);
    addList("Interstitial Findings", result.interstitial_findings); addList("Vascular Findings", result.vascular_findings);
    addList("Differential Diagnoses", result.differential_diagnoses); addList("Treatment Recommendations", result.treatment_recommendations);
    addList("Key References", result.key_references);
  } else if (result.most_likely_diagnosis !== undefined) {
    add("Most Likely Diagnosis", result.most_likely_diagnosis); add("Confidence", result.confidence_level);
    add("Case Summary", result.case_summary); add("Pathophysiology", result.pathophysiology);
    addList("Problem List", result.problem_list);
    result.differential_diagnoses?.length && lines.push(`Differentials:\n${result.differential_diagnoses.map(d=>`  • ${d.diagnosis} (${d.probability}) — ${d.reasoning}`).join("\n")}`);
    const mp = result.management_plan;
    if (mp) { addList("Immediate Management", mp.immediate); addList("Short-Term Management", mp.short_term); addList("Long-Term Management", mp.long_term); }
    addList("Red Flags", result.red_flags); addList("Additional Investigations", result.additional_investigations);
    addList("Counselling Points", result.counseling_points); add("Prognosis", result.prognosis); add("Follow-Up Plan", result.follow_up_plan);
    addList("Guidelines Applied", result.guidelines_applied);
    result.traceability_links?.length && lines.push(`Evidence Traceability:\n${result.traceability_links.map(t=>`  • ${t.recommendation} — ${t.guideline} ${t.section||""} [${t.evidence_grade||""}]`).join("\n")}`);
  }

  add("Evidence Grade", result.evidence_grade); add("Guideline", result.guideline_ref); add("Recommendation Strength", result.recommendation_strength);
  return lines.join("\n");
}