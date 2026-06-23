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
import ReportActions from "@/components/clinical-ai/ReportActions";

const DISCLAIMER = "This tool provides educational and clinical decision-support information and does not replace physician judgment. Clinical correlation and specialist genetic counselling is required.";

const ACMG_META = {
  "Pathogenic": { bg: "bg-red-50 border-red-300", text: "text-red-800", badge: "bg-red-600", meaning: "Strong evidence the variant causes disease. Genetic counselling and family testing indicated. CNI therapy likely ineffective in genetic SRNS." },
  "Likely Pathogenic": { bg: "bg-orange-50 border-orange-300", text: "text-orange-800", badge: "bg-orange-600", meaning: ">90% likely causative. Treat clinically as pathogenic. CNI response unlikely — consider alternative immunosuppression or supportive care." },
  "VUS": { bg: "bg-yellow-50 border-yellow-300", text: "text-yellow-800", badge: "bg-yellow-500", meaning: "Uncertain significance. Do not use alone to guide decisions. Recontact lab in 2 years for reclassification." },
  "Likely Benign": { bg: "bg-blue-50 border-blue-300", text: "text-blue-800", badge: "bg-blue-500", meaning: ">90% likely benign. No action required unless additional evidence emerges." },
  "Benign": { bg: "bg-green-50 border-green-300", text: "text-green-800", badge: "bg-green-600", meaning: "Strong evidence of no disease causation. No clinical action required." },
};

const LEARNING_POINTS = [
  "ACMG/AMP 2015 (Richards et al.) uses a 5-tier system: Pathogenic / Likely Pathogenic / VUS / Likely Benign / Benign — the global standard for clinical variant reporting.",
  "PVS1 (Very Strong pathogenic): null variants (nonsense, frameshift, ±1/2 splice, initiation codon, multi-exon deletion) in a gene where LOF is a known mechanism. Key caveat: do NOT apply if LOF is not the mechanism (e.g., MYH7, GFAP).",
  "PS2 requires BOTH maternity AND paternity confirmed by identity testing to claim de novo. PM6 applies when parental status is assumed but not confirmed.",
  "PP3 / BP4 (in silico computational evidence) can each be used only ONCE per variant even when multiple tools agree — they share algorithmic basis (SIFT, PolyPhen-2, CADD, MutationTaster, etc.).",
  "BA1 (stand-alone benign): allele frequency ≥5% in gnomAD/ExAC/1000 Genomes — this ALONE classifies a variant as benign regardless of other evidence.",
  "VUS variants must NEVER be used to guide clinical decisions or for predictive family testing. Re-contact the laboratory every 2 years — reclassification is common as databases grow.",
  "Trio sequencing (proband + both parents) increases diagnostic yield and allows de novo variant identification. De novo status upgrades pathogenicity from PM6 (moderate) to PS2 (strong).",
  "PATHOGENIC variants in NPHS1, NPHS2, WT1, LAMB2 → CNI (tacrolimus/cyclosporine) contraindicated — genetic SRNS does not respond to CNI therapy (ISPN 2021 §3.5, Grade 2C).",
  "Population frequency threshold (PM2): absent from large databases or at extremely low frequency if recessive. Check race-matched controls — VUS rates are higher in non-Caucasian patients due to under-representation in genomic databases.",
  "Functional studies (PS3/BS3) must be well-validated and reproducible in a clinical diagnostic lab setting. Not all published functional assays qualify.",
  "COL4A3/A4/A5 (Alport syndrome): start ACEi/ARB early regardless of proteinuria severity — even heterozygotes benefit (KDIGO 2022 Alport guidance).",
  "Secondary findings: ACMG recommends reporting pathogenic/likely pathogenic variants in 81 medically actionable genes (SF v3.2) even when unrelated to the indication. Discuss pre-test.",
];

const ACMG_CRITERIA_FULL = {
  pathogenic: [
    { code: "PVS1", strength: "Very Strong", desc: "Null variant (nonsense, frameshift, ±1/2 splice, initiation codon, multi-exon deletion) in a gene where LOF is a known pathogenic mechanism. Caveats: not if LOF is not mechanism; extreme 3' end; exon-skipping leaves protein intact; multiple transcripts." },
    { code: "PS1", strength: "Strong", desc: "Same amino acid change as previously established pathogenic variant, different nucleotide. Caveat: beware variants that impact splicing rather than amino acid level." },
    { code: "PS2", strength: "Strong", desc: "De novo (BOTH maternity AND paternity confirmed by identity testing) in patient with disease and no family history. Note: paternity confirmation alone is insufficient." },
    { code: "PS3", strength: "Strong", desc: "Well-established in vitro or in vivo functional studies show damaging effect on gene/gene product. Most rigorous when validated and reproducible in clinical diagnostic lab setting." },
    { code: "PS4", strength: "Strong", desc: "Prevalence in affected significantly increased vs controls. OR/RR >5.0 with CI not including 1.0." },
    { code: "PM1", strength: "Moderate", desc: "Variant in mutational hotspot or critical well-established functional domain (e.g., enzyme active site) without benign variation." },
    { code: "PM2", strength: "Moderate", desc: "Absent from large population databases or at extremely low frequency if recessive (gnomAD, ExAC, ESP, 1000 Genomes). Caveat: indel calls may be unreliable." },
    { code: "PM3", strength: "Moderate", desc: "For recessive disorders: detected in trans with pathogenic variant. Requires parental testing to confirm phase." },
    { code: "PM4", strength: "Moderate", desc: "Protein length changes from in-frame deletions/insertions in non-repeat region, or stop-loss variants." },
    { code: "PM5", strength: "Moderate", desc: "Novel missense at same amino acid residue as different known pathogenic missense (e.g., Arg156His is pathogenic → Arg156Cys). Caveat: beware splicing effects." },
    { code: "PM6", strength: "Moderate", desc: "Assumed de novo WITHOUT confirmation of paternity and maternity (upgrade to PS2 if confirmed)." },
    { code: "PP1", strength: "Supporting", desc: "Co-segregation with disease in multiple affected family members in gene definitively known to cause disease. Upgrades with increasing segregation data." },
    { code: "PP2", strength: "Supporting", desc: "Missense variant in gene with low benign missense variation rate where missense is a common disease mechanism." },
    { code: "PP3", strength: "Supporting", desc: "Multiple lines of computational evidence (SIFT, PolyPhen-2, CADD, MutationTaster, etc.) support deleterious effect. COUNT ONLY ONCE — tools share algorithmic basis." },
    { code: "PP4", strength: "Supporting", desc: "Patient phenotype or family history highly specific for disease with single genetic etiology." },
    { code: "PP5", strength: "Supporting", desc: "Reputable source recently reports variant as pathogenic but evidence not available for independent evaluation. Use cautiously." },
  ],
  benign: [
    { code: "BA1", strength: "Stand-Alone", desc: "Allele frequency ≥5% in ExAC, 1000 Genomes, or ESP/gnomAD. Standalone evidence — classifies variant as BENIGN alone." },
    { code: "BS1", strength: "Strong", desc: "Allele frequency greater than expected for the disorder based on disease prevalence and inheritance." },
    { code: "BS2", strength: "Strong", desc: "Observed in healthy adult for recessive (homozygous), dominant (heterozygous), or X-linked (hemizygous) disorder with full penetrance expected at early age." },
    { code: "BS3", strength: "Strong", desc: "Well-established functional studies show NO damaging effect on protein function or splicing." },
    { code: "BS4", strength: "Strong", desc: "Lack of segregation in affected family members. Caveat: phenocopies may mimic lack of segregation." },
    { code: "BP1", strength: "Supporting", desc: "Missense variant in a gene where ONLY truncating variants are known to cause disease." },
    { code: "BP2", strength: "Supporting", desc: "In trans with pathogenic variant for fully penetrant dominant disorder, OR in cis with pathogenic variant in any pattern." },
    { code: "BP3", strength: "Supporting", desc: "In-frame deletions/insertions in repetitive region without a known function." },
    { code: "BP4", strength: "Supporting", desc: "Multiple computational tools predict no impact. COUNT ONLY ONCE per variant evaluation." },
    { code: "BP5", strength: "Supporting", desc: "Variant found in case with an alternate molecular basis for disease." },
    { code: "BP6", strength: "Supporting", desc: "Reputable source recently reports variant as benign but evidence not available for independent evaluation." },
    { code: "BP7", strength: "Supporting", desc: "Synonymous (silent) variant where splicing algorithms predict no impact on splice consensus and nucleotide not highly conserved." },
  ],
};

const COMBINATION_RULES = [
  { tier: "PATHOGENIC", color: "bg-red-700 text-white", rules: ["PVS1 + ≥1 PS", "PVS1 + ≥2 PM", "PVS1 + PM + PP", "PVS1 + ≥2 PP", "≥2 PS", "PS + ≥3 PM", "PS + 2 PM + ≥2 PP", "PS + PM + ≥4 PP"] },
  { tier: "LIKELY PATHOGENIC", color: "bg-orange-500 text-white", rules: ["PVS1 + PM", "PS + 1–2 PM", "PS + ≥2 PP", "≥3 PM", "2 PM + ≥2 PP", "PM + ≥4 PP"] },
  { tier: "VUS", color: "bg-yellow-500 text-slate-900", rules: ["Criteria not met", "Contradictory P + B evidence"] },
  { tier: "LIKELY BENIGN", color: "bg-blue-500 text-white", rules: ["BS + BP", "≥2 BP"] },
  { tier: "BENIGN", color: "bg-green-700 text-white", rules: ["BA1 alone", "≥2 BS"] },
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
                {result.variant_hgvs && <div><span className="text-slate-500">Variant (HGVS)</span><p className="font-bold font-mono text-slate-800 text-[11px]">{result.variant_hgvs}</p></div>}
                {result.variant_type && <div><span className="text-slate-500">Variant Type</span><p className="font-semibold">{result.variant_type}</p></div>}
                {result.zygosity && <div><span className="text-slate-500">Zygosity</span><p className="font-semibold">{result.zygosity}</p></div>}
                {result.inheritance_pattern && <div><span className="text-slate-500">Inheritance</span><p className="font-semibold">{result.inheritance_pattern}</p></div>}
              </div>
              {result.population_frequency_note && (
                <p className="mt-2 text-[11px] text-slate-600 bg-slate-50 rounded p-1.5 border border-slate-200">
                  <span className="font-semibold">Population Frequency: </span>{result.population_frequency_note}
                </p>
              )}
              {result.is_nephrotic_gene && (
                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                  <Badge className="bg-violet-100 text-violet-800 text-[10px]">Nephrotic Syndrome Gene</Badge>
                  {result.cni_contraindicated && <Badge className="bg-red-100 text-red-800 text-[10px]">CNI Contraindicated</Badge>}
                </div>
              )}
            </div>
          )}

          {/* ACMG Criteria Applied */}
          {(result.pathogenic_evidence?.length > 0 || result.benign_evidence?.length > 0) && (
            <div className="bg-white rounded-xl p-3 border border-slate-200">
              <h4 className="font-semibold text-sm mb-2 text-slate-800">ACMG Criteria Applied</h4>
              {result.pathogenic_evidence?.length > 0 && (
                <div className="mb-2">
                  <p className="text-[11px] font-semibold text-red-700 mb-1">Pathogenic Evidence:</p>
                  <div className="flex flex-wrap gap-1">
                    {result.pathogenic_evidence.map((c, i) => (
                      <span key={i} className="text-[10px] bg-red-100 text-red-800 border border-red-200 rounded px-1.5 py-0.5 font-mono font-semibold">{c}</span>
                    ))}
                  </div>
                </div>
              )}
              {result.benign_evidence?.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold text-blue-700 mb-1">Benign Evidence:</p>
                  <div className="flex flex-wrap gap-1">
                    {result.benign_evidence.map((c, i) => (
                      <span key={i} className="text-[10px] bg-blue-100 text-blue-800 border border-blue-200 rounded px-1.5 py-0.5 font-mono font-semibold">{c}</span>
                    ))}
                  </div>
                </div>
              )}
              {result.acmg_classification_rationale && (
                <p className="mt-2 text-[11px] text-slate-700 bg-slate-50 rounded p-1.5 border border-slate-200">
                  <span className="font-semibold">Classification rationale: </span>{result.acmg_classification_rationale}
                </p>
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

          <ReportActions
            title="Genetic Report Analysis"
            result={result}
            summary={result ? `ACMG: ${result.acmg_class} · Gene: ${result.gene_identified || '—'} · ${result.variant_hgvs || ''}${result.prescription_suppressor_triggered ? '\n⚠ CNI CONTRAINDICATED' : ''}` : ""}
          />

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
          {/* 5-tier classification overview */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">ACMG/AMP 2015 — 5-Tier Classification (Richards et al.)</p>
            {Object.entries(ACMG_META).map(([cls, meta]) => (
              <div key={cls} className={`rounded-xl border p-3 ${meta.bg}`}>
                <p className={`text-xs font-bold ${meta.text} mb-1`}>{cls}</p>
                <p className={`text-xs ${meta.text}`}>{meta.meaning}</p>
              </div>
            ))}
          </div>

          {/* Combination rules */}
          <div>
            <p className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Combination Rules (Table 5, Richards et al. 2015)</p>
            <div className="space-y-2">
              {COMBINATION_RULES.map(rule => (
                <div key={rule.tier} className="rounded-lg overflow-hidden border">
                  <div className={`px-3 py-1.5 text-xs font-bold ${rule.color}`}>{rule.tier}</div>
                  <div className="p-2 flex flex-wrap gap-1">
                    {rule.rules.map((r, i) => (
                      <span key={i} className="text-[10px] bg-slate-50 border rounded px-1.5 py-0.5 font-mono">{r}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pathogenic criteria */}
          <div>
            <p className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Pathogenic Evidence Criteria (PVS/PS/PM/PP)</p>
            <div className="space-y-1.5">
              {ACMG_CRITERIA_FULL.pathogenic.map(c => (
                <div key={c.code} className="bg-white border border-red-100 rounded-xl p-2.5">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] font-bold font-mono bg-red-600 text-white px-1.5 py-0.5 rounded flex-shrink-0">{c.code}</span>
                    <span className="text-[10px] text-red-600 font-semibold">{c.strength}</span>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Benign criteria */}
          <div>
            <p className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Benign Evidence Criteria (BA/BS/BP)</p>
            <div className="space-y-1.5">
              {ACMG_CRITERIA_FULL.benign.map(c => (
                <div key={c.code} className="bg-white border border-blue-100 rounded-xl p-2.5">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] font-bold font-mono bg-blue-600 text-white px-1.5 py-0.5 rounded flex-shrink-0">{c.code}</span>
                    <span className="text-[10px] text-blue-600 font-semibold">{c.strength}</span>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Prescription suppressor */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-xs font-bold text-red-800 mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" /> PrescriptionSuppressor Rule
            </p>
            <p className="text-xs text-red-800">IF acmg_class = Pathogenic or Likely Pathogenic AND gene is a podocin/nephrin/WT1 gene → SUPPRESS CNI (tacrolimus/cyclosporine) prescription — genetic SRNS does NOT respond to CNI.</p>
            <p className="text-[10px] text-red-600 mt-1">ISPN 2021 §3.5 · Evidence Grade 2C · Suggestion</p>
          </div>

          {/* Key learning points */}
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

          {/* Common Nephrology genes */}
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

          {/* Key databases */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <p className="text-xs font-bold text-slate-700 mb-2">🗄️ Key Databases for Variant Interpretation (ACMG Table 1)</p>
            <div className="space-y-1">
              {[
                { name: "gnomAD / ExAC", use: "Population frequency (PM2 / BA1 / BS1). gnomAD v4 has 800k+ exomes." },
                { name: "ClinVar", use: "Clinical assertions from laboratories — check submitter quality and number of stars." },
                { name: "OMIM", use: "Gene-disease relationships and inheritance patterns." },
                { name: "ClinGen", use: "Curated gene-disease validity classifications (Definitive/Strong/Moderate/Limited)." },
                { name: "HGMD", use: "Variant annotations from literature — requires subscription; verify primary evidence." },
                { name: "LOVD", use: "Locus-specific databases — especially useful for rare disease genes." },
              ].map(db => (
                <div key={db.name} className="text-[11px] flex gap-2">
                  <span className="font-semibold text-slate-800 flex-shrink-0 w-28">{db.name}</span>
                  <span className="text-slate-600">{db.use}</span>
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
