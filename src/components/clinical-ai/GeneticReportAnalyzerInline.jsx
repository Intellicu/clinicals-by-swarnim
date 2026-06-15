/**
 * GeneticReportAnalyzerInline
 * Embeds the Genetics AI directly in the ClinicalAIHub tab (no page redirect).
 * Has Clinical Analysis + Educational tabs + disclaimer.
 */
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Dna, Loader2, Upload, BookOpen, Stethoscope, Heart, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

const DISCLAIMER = "This tool provides educational and clinical decision-support information and does not replace physician judgment. Clinical correlation and specialist genetic counselling is required.";

const ACMG_CLASSES = [
  { cls: "Pathogenic (Class 5)", bg: "bg-red-50 border-red-300", text: "text-red-800", meaning: "Strong evidence the variant causes disease. Genetic counselling and family testing indicated." },
  { cls: "Likely Pathogenic (Class 4)", bg: "bg-orange-50 border-orange-300", text: "text-orange-800", meaning: ">90% likely causative. Treat clinically as pathogenic, but document uncertainty." },
  { cls: "VUS (Class 3)", bg: "bg-yellow-50 border-yellow-300", text: "text-yellow-800", meaning: "Uncertain significance. Do not use alone to guide clinical decisions. Recontact in 2 years for reclassification." },
  { cls: "Likely Benign (Class 2)", bg: "bg-blue-50 border-blue-300", text: "text-blue-800", meaning: ">90% likely benign. No action required unless additional evidence emerges." },
  { cls: "Benign (Class 1)", bg: "bg-green-50 border-green-300", text: "text-green-800", meaning: "Strong evidence of no disease causation. No clinical action required." },
];

const LEARNING_POINTS = [
  "ACMG 5-tier classification (Pathogenic/Likely Pathogenic/VUS/Likely Benign/Benign) is the global standard for variant interpretation.",
  "VUS variants should not be used to guide clinical decisions — reclassification occurs frequently as population data grows.",
  "Trio sequencing (proband + both parents) dramatically improves diagnostic yield and helps confirm de novo status.",
  "Autosomal recessive nephropathy genes include NPHS1, NPHS2, WT1, LAMB2, COL4A3/A4/A5, UMOD, and >50 others.",
  "De novo variants in dominant genes (e.g. WT1, PAX2, HNF1B) explain sporadic cases without family history.",
  "Genetic counselling is mandatory before and after testing, particularly for at-risk family members.",
  "Phenotype-genotype correlation guides treatment: COL4A3/A4/A5 (Alport) → ACEi early; NPHS2 (podocin) → poor CNI response.",
  "VUS reclassification should be scheduled 2 years after report date — contact the reporting laboratory.",
];

const COMMON_NEPHROLOGY_GENES = [
  { gene: "NPHS1", disease: "Finnish-type Nephrotic Syndrome", inheritance: "AR", phenotype: "Massive proteinuria in neonates, CNI-resistant" },
  { gene: "NPHS2", disease: "SRNS (Podocin)", inheritance: "AR", phenotype: "CNI-resistant NS, 10–30% of childhood SRNS" },
  { gene: "WT1", disease: "Denys-Drash / Frasier", inheritance: "AD/De novo", phenotype: "NS + gonadal dysgenesis + Wilms tumor risk" },
  { gene: "COL4A3/A4/A5", disease: "Alport Syndrome", inheritance: "XL/AR/AD", phenotype: "Haematuria → CKD, sensorineural deafness, ocular anomalies" },
  { gene: "UMOD", disease: "UAKD / FJHN", inheritance: "AD", phenotype: "Hyperuricaemia, CKD, gout in young adults" },
  { gene: "HNF1B", disease: "RCAD / HNF1B nephropathy", inheritance: "AD", phenotype: "Renal cysts, MODY5 diabetes, genital malformations" },
  { gene: "TRPC6", disease: "FSGS", inheritance: "AD", phenotype: "Adult-onset proteinuria, aggressive FSGS" },
  { gene: "LAMB2", disease: "Pierson Syndrome", inheritance: "AR", phenotype: "Congenital NS + microcoria + neurodevelopmental delay" },
];

export default function GeneticReportAnalyzerInline() {
  const [activeTab, setActiveTab] = useState("clinical");
  const [reportText, setReportText] = useState("");
  const [reportFile, setReportFile] = useState(null);
  const [clinicalContext, setClinicalContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    setReportFile(e.target.files?.[0] || null);
    setResult(null);
  };

  const handleAnalyse = async () => {
    if (!reportText.trim() && !reportFile) {
      toast.error("Paste report text or upload a file to analyse");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      let fileUrl = null;
      if (reportFile) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: reportFile });
        fileUrl = file_url;
      }

      const prompt = `You are a paediatric clinical geneticist providing variant interpretation for clinical decision support.

${clinicalContext ? `Clinical context: ${clinicalContext}` : ""}
${reportText ? `Genetic report text:\n${reportText}` : ""}
${fileUrl ? "(Report file attached)" : ""}

Provide a structured interpretation using this exact format:

## Gene & Variant Identified
[Gene, HGVS notation c. and p., zygosity, inheritance pattern]

## ACMG Classification
[Pathogenic / Likely Pathogenic / VUS / Likely Benign / Benign — with rationale]

## Clinical Significance
[Does this variant explain the patient's phenotype? Genotype-phenotype correlation.]

## Disease Association
[Associated condition(s), typical clinical features, prognosis]

## Management Implications
[How does this genetic result change management? Specific monitoring or treatment implications.]

## Family Testing Recommendations
[Who should be tested? Inheritance implications for parents and siblings.]

## Genetic Counselling Points
[Key messages for the family. Reproductive implications if relevant.]

## Limitations & Next Steps
[What this test cannot rule out. Follow-up testing recommended.]

Use paediatric nephrology context where relevant. Flag urgent management implications clearly.`;

      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        model: "claude_sonnet_4_6",
        file_urls: fileUrl ? [fileUrl] : undefined,
      });
      setResult(res);
    } catch {
      toast.error("Analysis failed — please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Persistent disclaimer */}
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
        <Link to={createPageUrl("GeneticReportAnalyzer") + "?tab=counseling"} className="flex-1">
          <button
            className="w-full py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100">
            <Heart className="w-3.5 h-3.5" /> Counseling
          </button>
        </Link>
        <button onClick={() => setActiveTab("education")}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${activeTab === "education" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          <BookOpen className="w-3.5 h-3.5" /> Educational Mode
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
              <input type="file" accept=".pdf,.txt,.doc,.docx,image/*" onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer" />
              {reportFile ? (
                <p className="text-sm text-violet-700 font-semibold">📄 {reportFile.name}</p>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Upload genetic report (PDF, image, or document)</p>
                </>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Or paste report text / variant details</label>
              <textarea
                value={reportText}
                onChange={e => setReportText(e.target.value)}
                placeholder="e.g. Gene: NPHS2, c.686G>A (p.Arg229Gln), Homozygous, ACMG Class: Pathogenic..."
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300 min-h-[100px] resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Clinical context (helps interpretation)</label>
              <input
                value={clinicalContext}
                onChange={e => setClinicalContext(e.target.value)}
                placeholder="e.g. 4-year-old, SRNS, no family history, Indian ethnicity"
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300 h-9"
              />
            </div>

            <Button onClick={handleAnalyse} disabled={loading || (!reportText.trim() && !reportFile)}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analysing...</> : <><Dna className="w-4 h-4" /> Interpret Genetic Report</>}
            </Button>
          </div>

          {result && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Dna className="w-4 h-4 text-violet-600" />
                <p className="text-sm font-bold text-slate-800">Genetic Interpretation</p>
                <Badge className="ml-auto bg-violet-100 text-violet-700 text-xs">AI-generated · verify with geneticist</Badge>
              </div>
              <ReactMarkdown className="prose prose-sm max-w-none text-slate-800 [&>h2]:text-sm [&>h2]:font-bold [&>h2]:text-violet-800 [&>h2]:mt-3 [&>p]:text-sm [&>ul]:text-sm">
                {result}
              </ReactMarkdown>
              <Alert className="bg-amber-50 border-amber-300 mt-4 py-2">
                <AlertDescription className="text-amber-800 text-xs">{DISCLAIMER}</AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      )}

      {/* ── Educational Mode ── */}
      {activeTab === "education" && (
        <div className="space-y-4">
          {/* ACMG classification guide */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">ACMG Variant Classification Guide</p>
            {ACMG_CLASSES.map((c, i) => (
              <div key={i} className={`rounded-xl border p-3 ${c.bg}`}>
                <p className={`text-xs font-bold ${c.text} mb-1`}>{c.cls}</p>
                <p className={`text-xs ${c.text}`}>{c.meaning}</p>
              </div>
            ))}
          </div>

          {/* Learning pearls */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
            <p className="text-xs font-bold text-blue-800 mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> Key Learning Points — Clinical Genetics
            </p>
            <ul className="space-y-1.5">
              {LEARNING_POINTS.map((p, i) => (
                <li key={i} className="text-xs text-blue-900 flex items-start gap-2">
                  <span className="text-blue-400 font-bold flex-shrink-0">{i + 1}.</span> {p}
                </li>
              ))}
            </ul>
          </div>

          {/* Common nephrology genes table */}
          <div>
            <p className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Common Paediatric Nephrology Genes</p>
            <div className="space-y-2">
              {COMMON_NEPHROLOGY_GENES.map((g, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-violet-700 font-mono">{g.gene}</span>
                    <Badge className="bg-slate-100 text-slate-600 text-[10px]">{g.inheritance}</Badge>
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