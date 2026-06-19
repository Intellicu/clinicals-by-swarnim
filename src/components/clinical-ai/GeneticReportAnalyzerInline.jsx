/**
 * GeneticReportAnalyzerInline
 * Structured JSON output with ACMG classification, nephrotic gene flagging,
 * and PrescriptionSuppressor integration.
 */
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Dna, Loader2, Upload, BookOpen, Stethoscope, Heart, ShieldAlert, ShieldCheck, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import { invokeGeneticsAnalyzer } from "@/lib/LLMService";
import { buildTraceabilityLink } from "@/lib/CIEEEngine";

const DISCLAIMER = "This tool provides educational and clinical decision-support information and does not replace physician judgment. Clinical correlation and specialist genetic counselling is required.";

const ACMG_META = {
  "Pathogenic": { bg: "bg-red-50 border-red-300", text: "text-red-800", badge: "bg-red-600", meaning: "Strong evidence the variant causes disease. Genetic counselling and family testing indicated. CNI therapy likely ineffective in genetic SRNS." },
  "Likely Pathogenic": { bg: "bg-orange-50 border-orange-300", text: "text-orange-800", badge: "bg-orange-600", meaning: ">90% likely causative. Treat clinically as pathogenic. CNI response unlikely — consider alternative immunosuppression or supportive care." },
  "VUS": { bg: "bg-yellow-50 border-yellow-300", text: "text-yellow-800", badge: "bg-yellow-500", meaning: "Uncertain significance. Do not use alone to guide decisions. Recontact lab in 2 years for reclassification." },
  "Likely Benign": { bg: "bg-blue-50 border-blue-300", text: "text-blue-800", badge: "bg-blue-500", meaning: ">90% likely benign. No action required unless additional evidence emerges." },
  "Benign": { bg: "bg-green-50 border-green-300", text: "text-green-800", badge: "bg-green-600", meaning: "Strong evidence of no disease causation. No clinical action required." },
};

const LEARNING_POINTS = [
  "ACMG 5-tier classification (Pathogenic/Likely Pathogenic/VUS/Likely Benign/Benign) is the global standard for variant interpretation.",
  "VUS variants should not be used to guide clinical decisions — reclassification occurs frequently as population data grows.",
  "Trio sequencing (proband + both parents) dramatically improves diagnostic yield and helps confirm de novo status.",
  "Autosomal recessive nephropathy genes include NPHS1, NPHS2, WT1, LAMB2, COL4A3/A4/A5, UMOD, and >50 others.",
  "De novo variants in dominant genes (e.g. WT1, PAX2, HNF1B) explain sporadic cases without family history.",
  "Phenotype-genotype correlation guides treatment: COL4A3/A4/A5 (Alport) → ACEi early; NPHS2 (podocin) → poor CNI response.",
  "VUS reclassification should be scheduled 2 years after report date — contact the reporting laboratory.",
  "PATHOGENIC variants in NPHS1, NPHS2, WT1, LAMB2 → CNI contraindicated (ISPN 2021 §3.5, Grade 2C).",
];

const COMMON_NEPHROLOGY_GENES = [
  { gene: "NPHS1", disease: "Finnish-type Nephrotic Syndrome", inheritance: "AR", phenotype: "Massive proteinuria neonates; CNI-resistant", cni_risk: true },
  { gene: "NPHS2", disease: "SRNS (Podocin)", inheritance: "AR", phenotype: "CNI-resistant NS; 10–30% childhood SRNS", cni_risk: true },
  { gene: "WT1", disease: "Denys-Drash / Frasier", inheritance: "AD/De novo", phenotype: "NS + gonadal dysgenesis + Wilms tumor risk", cni_risk: true },
  { gene: "LAMB2", disease: "Pierson Syndrome", inheritance: "AR", phenotype: "Congenital NS + microcoria; CNI ineffective", cni_risk: true },
  { gene: "PLCE1", disease: "SRNS", inheritance: "AR", phenotype: "Early-onset SRNS; some respond to CNI", cni_risk: false },
  { gene: "TRPC6", disease: "FSGS", inheritance: "AD", phenotype: "Adult-onset proteinuria; aggressive FSGS", cni_risk: false },
  { gene: "INF2", disease: "FSGS", inheritance: "AD", phenotype: "Focal segmental sclerosis with Charcot-Marie-Tooth", cni_risk: false },
  { gene: "COL4A3/A4/A5", disease: "Alport Syndrome", inheritance: "XL/AR/AD", phenotype: "Haematuria → CKD; sensorineural deafness", cni_risk: false },
];

export default function GeneticReportAnalyzerInline() {
  const [activeTab, setActiveTab] = useState("clinical");
  const [reportText, setReportText] = useState("");
  const [reportFile, setReportFile] = useState(null);
  const [clinicalContext, setClinicalContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyse = async () => {
    if (!reportText.trim() && !reportFile) {
      toast.error("Paste report text or upload a file to analyse");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const llmResult = await invokeGeneticsAnalyzer({ reportText, reportFile, clinicalContext });
      if (!llmResult.success) {
        toast.error("Analysis failed — please try again");
        return;
      }
      setResult(llmResult.data);
      setActiveTab("results");
    } catch {
      toast.error("Analysis failed — please try again");
    } finally {
      setLoading(false);
    }
  };

  const acmgMeta = result ? (ACMG_META[result.acmg_class] || ACMG_META['VUS']) : null;
  const trace = result ? buildTraceabilityLink('GS-ISPN-2021-GENETICS', { gene: result.gene_identified }) : null;

  return (
    <div className="space-y-4 pb-6">
      <Alert className="bg-amber-50 border-amber-300 py-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <AlertDescription className="text-amber-800 text-xs">{DISCLAIMER}</AlertDescription>
      </Alert>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        <button onClick={() => setActiveTab("clinical")}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${activeTab === "clinical" ? "bg-white text-violet-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          <Stethoscope className="w-3.5 h-3.5" /> Clinical Analysis
        </button>
        {result && (
          <button onClick={() => setActiveTab("results")}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${activeTab === "results" ? "bg-white text-violet-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            <Dna className="w-3.5 h-3.5" /> Results
          </button>
        )}
        <Link to={createPageUrl("GeneticReportAnalyzer") + "?tab=counseling"} className="flex-1">
          <button className="w-full py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100">
            <Heart className="w-3.5 h-3.5" /> Counseling
          </button>
        </Link>
        <button onClick={() => setActiveTab("education")}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${activeTab === "education" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          <BookOpen className="w-3.5 h-3.5" /> Educational
        </button>
      </div>

      {/* ── Clinical Analysis ── */}
      {activeTab === "clinical" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
            <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Dna className="w-4 h-4 text-violet-600" /> Genetic Report Input
            </p>

            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-violet-400 transition-colors cursor-pointer relative">
              <input type="file" accept=".pdf,.txt,.doc,.docx,image/*,.vcf" onChange={e => setReportFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer" />
              {reportFile ? (
                <p className="text-sm text-violet-700 font-semibold">📄 {reportFile.name}</p>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Upload genetic report (PDF, image, VCF, or document)</p>
                </>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Or paste report text / variant details</label>
              <textarea value={reportText} onChange={e => setReportText(e.target.value)}
                placeholder="e.g. Gene: NPHS2, c.686G>A (p.Arg229Gln), Homozygous, ACMG Class: Pathogenic..."
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300 min-h-[100px] resize-none" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Clinical context (improves interpretation)</label>
              <input value={clinicalContext} onChange={e => setClinicalContext(e.target.value)}
                placeholder="e.g. 4-year-old, SRNS, no family history, Indian ethnicity"
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300 h-9" />
            </div>

            <Button onClick={handleAnalyse} disabled={loading || (!reportText.trim() && !reportFile)}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analysing...</> : <><Dna className="w-4 h-4" /> Interpret Genetic Report</>}
            </Button>
          </div>
        </div>
      )}

      {/* ── Results Tab ── */}
      {activeTab === "results" && result && (
        <div className="space-y-4">

          {/* PrescriptionSuppressor alert */}
          {result.prescription_suppressor_triggered && (
            <div className="bg-red-50 border-2 border-red-400 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-900 text-sm">PRESCRIPTION SUPPRESSOR ACTIVATED</p>
                  <p className="text-xs text-red-800 mt-1">{result.suppression_reason || `CNI (tacrolimus/cyclosporine) contraindicated: ${result.acmg_class} variant in ${result.gene_identified || 'nephrotic gene'}. Genetic SRNS does not respond to CNI therapy.`}</p>
                  <p className="text-[10px] text-red-700 mt-1">ISPN 2021 §3.5 · Evidence Grade {trace?.evidence_grade || '2C'} · {trace?.recommendation_strength || 'Suggestion'}</p>
                </div>
              </div>
            </div>
          )}

          {/* ACMG classification */}
          {acmgMeta && (
            <div className={`rounded-xl border p-4 ${acmgMeta.bg}`}>
              <div className="flex items-center justify-between mb-2">
                <p className={`font-bold text-sm ${acmgMeta.text}`}>ACMG Classification</p>
                <Badge className={`${acmgMeta.badge} text-white`}>{result.acmg_class}</Badge>
              </div>
              <p className={`text-xs ${acmgMeta.text}`}>{acmgMeta.meaning}</p>
            </div>
          )}

          {/* Gene and variant */}
          {(result.gene_identified || result.variant_hgvs) && (
            <div className="bg-white rounded-xl p-4 border border-violet-200">
              <h4 className="font-semibold text-sm mb-2 text-violet-800">Gene & Variant</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {result.gene_identified && <div><span className="text-slate-500">Gene</span><p className="font-bold font-mono text-violet-700">{result.gene_identified}</p></div>}
                {result.variant_hgvs && <div><span className="text-slate-500">Variant</span><p className="font-bold font-mono text-slate-800 text-[11px]">{result.variant_hgvs}</p></div>}
                {result.zygosity && <div><span className="text-slate-500">Zygosity</span><p className="font-semibold">{result.zygosity}</p></div>}
                {result.inheritance_pattern && <div><span className="text-slate-500">Inheritance</span><p className="font-semibold">{result.inheritance_pattern}</p></div>}
              </div>
              {result.is_nephrotic_gene && (
                <div className="mt-2 flex items-center gap-1.5">
                  <Badge className="bg-violet-100 text-violet-800 text-[10px]">Nephrotic Syndrome Gene</Badge>
                  {result.cni_contraindicated && <Badge className="bg-red-100 text-red-800 text-[10px]">CNI Contraindicated</Badge>}
                </div>
              )}
            </div>
          )}

          {/* Clinical significance */}
          {result.clinical_significance && (
            <div className="bg-white rounded-xl p-3">
              <h4 className="font-semibold text-sm mb-1">Clinical Significance</h4>
              <p className="text-xs text-slate-700">{result.clinical_significance}</p>
            </div>
          )}

          {result.disease_association && (
            <div className="bg-white rounded-xl p-3">
              <h4 className="font-semibold text-sm mb-1">Disease Association</h4>
              <p className="text-xs text-slate-700">{result.disease_association}</p>
            </div>
          )}

          {/* Management implications */}
          {result.management_implications?.length > 0 && (
            <div className="bg-green-50 rounded-xl p-3 border border-green-200">
              <h4 className="font-semibold text-sm mb-2 text-green-900">Management Implications</h4>
              <ul className="space-y-1">{result.management_implications.map((m, i) => <li key={i} className="text-xs text-green-800">✓ {m}</li>)}</ul>
            </div>
          )}

          {/* Family testing */}
          {result.family_testing_recommended && (
            <div className="bg-purple-50 rounded-xl p-3 border border-purple-200">
              <div className="flex items-center gap-2 mb-1">
                <Heart className="w-4 h-4 text-purple-600" />
                <h4 className="font-semibold text-sm text-purple-900">Family Testing Recommended</h4>
              </div>
              {result.family_testing_rationale && <p className="text-xs text-purple-800">{result.family_testing_rationale}</p>}
            </div>
          )}

          {result.counseling_points?.length > 0 && (
            <div className="bg-rose-50 rounded-xl p-3 border border-rose-200">
              <h4 className="font-semibold text-sm mb-2 text-rose-900">Counselling Points</h4>
              <ul className="space-y-1">{result.counseling_points.map((c, i) => <li key={i} className="text-xs text-rose-800">💬 {c}</li>)}</ul>
            </div>
          )}

          {result.next_steps?.length > 0 && (
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
              <h4 className="font-semibold text-sm mb-2 text-blue-900">Next Steps</h4>
              <ul className="space-y-1">{result.next_steps.map((s, i) => <li key={i} className="text-xs text-blue-800">→ {s}</li>)}</ul>
            </div>
          )}

          {/* TraceabilityLinker */}
          {trace && (
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <div className="flex items-center gap-2 mb-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                <h4 className="font-semibold text-xs text-slate-600">Evidence & Traceability</h4>
              </div>
              <div className="flex flex-wrap gap-1.5 text-xs">
                <Badge variant="outline" className="text-[10px]">Grade {result.evidence_grade || trace.evidence_grade}</Badge>
                <Badge variant="outline" className="text-[10px]">{result.recommendation_strength || trace.recommendation_strength}</Badge>
                <span className="text-slate-500 text-[10px] self-center">{trace.guideline_name} §{trace.guideline_section}</span>
              </div>
              {trace.pmid && <p className="text-[10px] text-slate-400 mt-1">PMID: {trace.pmid}</p>}
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => { setResult(null); setActiveTab("clinical"); }}>
              New Analysis
            </Button>
            <Link to={createPageUrl("GeneticReportAnalyzer") + "?tab=counseling"} className="flex-1">
              <Button variant="outline" size="sm" className="w-full text-rose-600 border-rose-200">
                <Heart className="w-3.5 h-3.5 mr-1" /> Counselling Report
              </Button>
            </Link>
          </div>

          <Alert className="bg-amber-50 border-amber-300 py-2">
            <AlertDescription className="text-amber-800 text-xs">{DISCLAIMER}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* ── Educational Mode ── */}
      {activeTab === "education" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">ACMG Variant Classification</p>
            {Object.entries(ACMG_META).map(([cls, meta]) => (
              <div key={cls} className={`rounded-xl border p-3 ${meta.bg}`}>
                <p className={`text-xs font-bold ${meta.text} mb-1`}>{cls}</p>
                <p className={`text-xs ${meta.text}`}>{meta.meaning}</p>
              </div>
            ))}
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-xs font-bold text-red-800 mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" /> PrescriptionSuppressor Rule
            </p>
            <p className="text-xs text-red-800">IF genetic_variant_status = PATHOGENIC AND drug_class = CNI (tacrolimus/cyclosporine) → SUPPRESS prescription + log suppression_event</p>
            <p className="text-[10px] text-red-600 mt-1">ISPN 2021 §3.5 · Evidence Grade 2C · Suggestion</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
            <p className="text-xs font-bold text-blue-800 mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> Key Learning Points
            </p>
            <ul className="space-y-1.5">
              {LEARNING_POINTS.map((p, i) => (
                <li key={i} className="text-xs text-blue-900 flex items-start gap-2">
                  <span className="text-blue-400 font-bold flex-shrink-0">{i + 1}.</span> {p}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Common Paediatric Nephrology Genes</p>
            <div className="space-y-2">
              {COMMON_NEPHROLOGY_GENES.map((g, i) => (
                <div key={i} className={`bg-white border rounded-xl p-3 ${g.cni_risk ? 'border-red-200' : 'border-slate-200'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-violet-700 font-mono">{g.gene}</span>
                    <Badge className="bg-slate-100 text-slate-600 text-[10px]">{g.inheritance}</Badge>
                    {g.cni_risk && <Badge className="bg-red-100 text-red-700 text-[10px]">CNI risk</Badge>}
                  </div>
                  <p className="text-xs font-semibold text-slate-800">{g.disease}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{g.phenotype}</p>
                </div>
              ))}
            </div>
          </div>

          <Alert className="bg-amber-50 border-amber-300 py-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <AlertDescription className="text-amber-800 text-xs">{DISCLAIMER}</AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
