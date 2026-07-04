import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/client";
import { toast } from "sonner";
import {
  Upload, FileText, Brain, CheckCircle2, AlertTriangle, Info,
  ChevronRight, Loader2, Sparkles, ArrowRight, Eye, Download,
  X, Clock, FileCheck, Plus, Edit3, History
} from "lucide-react";
import { classifyStudyType, suggestNextSteps, STUDY_TYPES } from "@/lib/AdaptiveMethodologyEngine";

const DOC_TYPES = {
  protocol: { label: "Protocol / Synopsis", color: "bg-indigo-100 text-indigo-700", icon: FileText },
  manuscript: { label: "Manuscript Draft", color: "bg-purple-100 text-purple-700", icon: FileText },
  thesis: { label: "Thesis / Dissertation", color: "bg-blue-100 text-blue-700", icon: FileText },
  crf: { label: "Case Report Form", color: "bg-green-100 text-green-700", icon: FileCheck },
  ethics: { label: "Ethics / IEC Form", color: "bg-amber-100 text-amber-700", icon: FileCheck },
  literature: { label: "Literature / Paper", color: "bg-rose-100 text-rose-700", icon: BookIcon },
  other: { label: "Other Document", color: "bg-slate-100 text-slate-600", icon: FileText },
};

function BookIcon(props) { return <FileText {...props} />; }

const SECTION_MAP = {
  background: ["background", "introduction", "rationale", "literature review", "review of literature", "context"],
  objectives: ["objective", "aim", "goals", "purpose", "question"],
  hypothesis: ["hypothesis", "null hypothesis", "h0", "h1", "alternate hypothesis"],
  methods: ["methods", "methodology", "materials and methods", "study design", "study method", "study protocol", "design"],
  variables: ["variables", "parameters", "data items", "measurements", "outcomes measured"],
  sample_size: ["sample size", "sample calculation", "statistical power", "power calculation", "sample justification"],
  statistical_plan: ["statistical analysis", "statistical methods", "data analysis", "statistical plan", "analysis plan"],
  eligibility: ["inclusion criteria", "exclusion criteria", "eligibility", "selection criteria", "participant criteria"],
  references: ["references", "bibliography", "citations"],
  results: ["results", "findings", "observations"],
  discussion: ["discussion", "interpretation", "limitations"],
};

function detectSectionType(heading) {
  const h = heading.toLowerCase();
  for (const [type, keywords] of Object.entries(SECTION_MAP)) {
    if (keywords.some(k => h.includes(k))) return type;
  }
  return null;
}

export default function ResearchContinuationWorkspace({ project, onProjectUpdate }) {
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState(null);
  const [docType, setDocType] = useState(null);
  const [sections, setSections] = useState([]);
  const [importing, setImporting] = useState({});
  const [importHistory, setImportHistory] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const fileRef = useRef();

  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setExtracted(null);
    setSections([]);
    setAnalysisResult(null);

    try {
      // Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // Extract text content
      const extractResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            full_text: { type: "string" },
            document_type: { type: "string" },
            title: { type: "string" },
            headings: { type: "array", items: { type: "string" } },
            sections: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  heading: { type: "string" },
                  content: { type: "string" }
                }
              }
            }
          }
        }
      });

      if (extractResult.status !== "success" || !extractResult.output) {
        toast.error("Could not extract text from document. Try a different format.");
        return;
      }

      const rawData = extractResult.output;
      setExtracted({ file_url, raw: rawData, fileName: file.name });

      // AI analysis
      await analyzeDocument(rawData, file.name);
    } catch (err) {
      toast.error("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const analyzeDocument = async (rawData, fileName) => {
    setAnalyzing(true);
    try {
      const textSample = (rawData.full_text || "").slice(0, 4000);
      const headings = rawData.headings || [];

      const prompt = `You are an expert clinical research methodology analyst.

Document: "${fileName}"
Detected headings: ${headings.join(" | ")}
Text excerpt:
${textSample}

Analyze this document and provide:
1. Document type (protocol/manuscript/thesis/crf/ethics/literature/other)
2. Study title if found
3. Study type classification (descriptive/crossSectional/retrospective/prospectiveCohort/rct/caseControl/diagnostic/prognostic/qualitative/systematicReview/registry)
4. Sections identified with their content status
5. Completeness assessment — what is complete, what is missing or weak
6. Next recommended steps (max 5)

Reply with JSON:
{
  "document_type": "...",
  "study_title": "...",
  "study_type": "...",
  "sections_found": [{"name": "...", "mapped_to": "...", "status": "complete/partial/weak", "excerpt": "..."}],
  "completeness": {"complete": [...], "incomplete": [...], "missing": [...]},
  "next_steps": ["..."],
  "academic_tone_rating": "excellent/good/needs_improvement",
  "key_gaps": ["..."]
}`;

      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            document_type: { type: "string" },
            study_title: { type: "string" },
            study_type: { type: "string" },
            sections_found: { type: "array", items: { type: "object", additionalProperties: true } },
            completeness: { type: "object", additionalProperties: true },
            next_steps: { type: "array", items: { type: "string" } },
            academic_tone_rating: { type: "string" },
            key_gaps: { type: "array", items: { type: "string" } },
          }
        }
      });

      setDocType(analysis.document_type || "other");
      setAnalysisResult(analysis);

      // Map sections
      const mappedSections = (analysis.sections_found || []).map((s, i) => ({
        id: i,
        heading: s.name,
        mapped_to: s.mapped_to || detectSectionType(s.name),
        status: s.status || "partial",
        excerpt: s.excerpt || "",
        selected: false,
      }));
      setSections(mappedSections);

    } catch {
      toast.error("AI analysis failed. You can still manually map sections.");
    } finally {
      setAnalyzing(false);
    }
  };

  const importSection = async (section) => {
    if (!project || !section.mapped_to) {
      toast.error("Cannot import: no target field mapped");
      return;
    }

    const confirmed = window.confirm(
      `Import content into "${section.mapped_to}" field?\n\nThis will NOT overwrite existing data — it will be appended for your review.`
    );
    if (!confirmed) return;

    setImporting(p => ({ ...p, [section.id]: true }));
    try {
      // Fetch full content for this section
      const prompt = `Extract and clean the following section content from the document for academic use.
Section: "${section.heading}"
Raw excerpt: ${section.excerpt || "(use heading to infer)"}
Full document text sample: ${(extracted?.raw?.full_text || "").slice(0, 3000)}

Return ONLY the clean, formatted academic text content for this section. Preserve academic language. Remove page numbers, headers, or formatting artifacts.`;

      const cleanContent = await base44.integrations.Core.InvokeLLM({ prompt });

      // Map to project field
      const fieldMap = {
        background: "pico.background",
        objectives: "objectives",
        hypothesis: "hypothesis",
        methods: "statistical_plan",
        variables: null, // handled separately
        sample_size: "sample_size.justification",
        statistical_plan: "statistical_plan",
        eligibility: null, // handled separately
        references: null,
      };

      const fieldPath = fieldMap[section.mapped_to];
      let updateData = {};

      if (section.mapped_to === "objectives") {
        const existing = project.objectives || [];
        updateData = { objectives: [...existing, cleanContent] };
      } else if (section.mapped_to === "hypothesis") {
        updateData = { hypothesis: (project.hypothesis || "") + "\n\n[IMPORTED]\n" + cleanContent };
      } else if (section.mapped_to === "statistical_plan" || section.mapped_to === "methods") {
        updateData = { statistical_plan: (project.statistical_plan || "") + "\n\n[IMPORTED: " + section.heading + "]\n" + cleanContent };
      } else if (section.mapped_to === "sample_size") {
        updateData = { sample_size: { ...(project.sample_size || {}), justification: cleanContent } };
      }

      if (Object.keys(updateData).length > 0) {
        await base44.entities.ResearchProject.update(project.id, updateData);
        onProjectUpdate?.({ ...project, ...updateData });
        toast.success(`Imported "${section.heading}" → ${section.mapped_to}`);
        setImportHistory(h => [...h, { heading: section.heading, mapped_to: section.mapped_to, timestamp: new Date().toISOString() }]);
        setSections(prev => prev.map(s => s.id === section.id ? { ...s, imported: true } : s));
      } else {
        toast.info("Manual import needed — open Study Builder to paste this content.");
      }
    } catch {
      toast.error("Import failed");
    } finally {
      setImporting(p => ({ ...p, [section.id]: false }));
    }
  };

  const jumpToNextIncomplete = () => {
    if (!analysisResult?.completeness?.missing?.length) return;
    toast.info(`Next incomplete: "${analysisResult.completeness.missing[0]}" — open Study Builder to complete it.`);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
        <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-1">
          <Upload className="w-5 h-5 text-indigo-600" />
          Import & Continue Research
        </h3>
        <p className="text-sm text-slate-600">
          Upload an existing protocol, manuscript, thesis, or CRF. The AI will analyze it, map sections to your project, and identify what needs to be completed.
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${uploading ? "border-indigo-400 bg-indigo-50" : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50"}`}
        onClick={() => fileRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFileUpload(e.dataTransfer.files[0]); }}
      >
        <input ref={fileRef} type="file" className="hidden"
          accept=".pdf,.docx,.doc,.txt,.pptx,.ppt,.png,.jpg,.jpeg"
          onChange={e => handleFileUpload(e.target.files[0])} />
        {uploading ? (
          <div className="space-y-2">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mx-auto" />
            <p className="text-sm font-medium text-indigo-600">Uploading & extracting text...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Drop your document here or click to browse</p>
            <p className="text-xs text-slate-500">Supported: PDF, DOCX, TXT, PPT, JPG/PNG · Max 10MB</p>
            <div className="flex justify-center gap-2 mt-2 flex-wrap">
              {Object.values(DOC_TYPES).slice(0, 5).map(dt => (
                <Badge key={dt.label} variant="outline" className="text-xs">{dt.label}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Analysis in Progress */}
      {analyzing && (
        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardContent className="p-4 flex items-center gap-3">
            <Brain className="w-6 h-6 text-purple-600 animate-pulse" />
            <div>
              <p className="text-sm font-semibold text-purple-800">AI is analyzing your document...</p>
              <p className="text-xs text-purple-600">Detecting document type · Classifying sections · Identifying gaps</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {analysisResult && !analyzing && (
        <div className="space-y-4">
          {/* Document Summary */}
          <Card className="border-2 border-green-200">
            <CardHeader className="pb-2 bg-green-50">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Document Analysis Complete
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {docType && DOC_TYPES[docType] && (
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <div className="font-semibold text-slate-500 mb-0.5">Document Type</div>
                    <Badge className={DOC_TYPES[docType].color}>{DOC_TYPES[docType].label}</Badge>
                  </div>
                )}
                {analysisResult.study_type && STUDY_TYPES[analysisResult.study_type] && (
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <div className="font-semibold text-slate-500 mb-0.5">Study Design</div>
                    <Badge className={STUDY_TYPES[analysisResult.study_type].color}>
                      {STUDY_TYPES[analysisResult.study_type].shortLabel}
                    </Badge>
                  </div>
                )}
                {analysisResult.study_title && (
                  <div className="p-2 bg-slate-50 rounded-lg col-span-2">
                    <div className="font-semibold text-slate-500 mb-0.5">Detected Title</div>
                    <div className="text-slate-800">{analysisResult.study_title}</div>
                  </div>
                )}
                {analysisResult.academic_tone_rating && (
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <div className="font-semibold text-slate-500 mb-0.5">Writing Quality</div>
                    <Badge variant="outline" className={
                      analysisResult.academic_tone_rating === "excellent" ? "text-green-700 border-green-300" :
                      analysisResult.academic_tone_rating === "good" ? "text-amber-700 border-amber-300" :
                      "text-red-700 border-red-300"
                    }>{analysisResult.academic_tone_rating}</Badge>
                  </div>
                )}
              </div>

              {/* Completion Status */}
              <div className="grid md:grid-cols-3 gap-3">
                {analysisResult.completeness?.complete?.length > 0 && (
                  <div className="p-2 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-xs font-semibold text-green-700 mb-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />Complete sections ({analysisResult.completeness.complete.length})
                    </div>
                    {analysisResult.completeness.complete.map((c, i) => (
                      <div key={i} className="text-xs text-green-700">✓ {c}</div>
                    ))}
                  </div>
                )}
                {analysisResult.completeness?.incomplete?.length > 0 && (
                  <div className="p-2 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="text-xs font-semibold text-amber-700 mb-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />Incomplete ({analysisResult.completeness.incomplete.length})
                    </div>
                    {analysisResult.completeness.incomplete.map((c, i) => (
                      <div key={i} className="text-xs text-amber-700">⚠ {c}</div>
                    ))}
                  </div>
                )}
                {analysisResult.completeness?.missing?.length > 0 && (
                  <div className="p-2 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-xs font-semibold text-red-700 mb-1 flex items-center gap-1">
                      <X className="w-3 h-3" />Missing ({analysisResult.completeness.missing.length})
                    </div>
                    {analysisResult.completeness.missing.map((c, i) => (
                      <div key={i} className="text-xs text-red-700">✗ {c}</div>
                    ))}
                  </div>
                )}
              </div>

              {/* Next Steps */}
              {analysisResult.next_steps?.length > 0 && (
                <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                  <div className="text-xs font-semibold text-indigo-700 mb-2 flex items-center gap-1">
                    <ArrowRight className="w-3 h-3" />Suggested Next Steps
                  </div>
                  {analysisResult.next_steps.map((step, i) => (
                    <div key={i} className="text-xs text-indigo-700 flex items-start gap-1.5 mb-1">
                      <span className="bg-indigo-200 text-indigo-800 rounded-full w-4 h-4 flex items-center justify-center shrink-0 text-xs font-bold">{i + 1}</span>
                      {step}
                    </div>
                  ))}
                </div>
              )}

              {/* Key gaps */}
              {analysisResult.key_gaps?.length > 0 && (
                <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="text-xs font-semibold text-amber-700 mb-1">Key methodology gaps identified:</div>
                  {analysisResult.key_gaps.map((g, i) => (
                    <div key={i} className="text-xs text-amber-700">• {g}</div>
                  ))}
                </div>
              )}

              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 gap-2" onClick={jumpToNextIncomplete}>
                <ChevronRight className="w-4 h-4" />Jump to Next Incomplete Section
              </Button>
            </CardContent>
          </Card>

          {/* Section Mapping */}
          {sections.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-indigo-600" />
                  Detected Sections — Import into Project
                  <Badge variant="outline" className="ml-auto text-xs">{sections.length} sections found</Badge>
                </CardTitle>
                <p className="text-xs text-slate-500">Review extracted content. Click "Import" to add to your project. Original document is preserved.</p>
              </CardHeader>
              <CardContent className="p-3 space-y-2">
                {sections.map(section => {
                  const Icon = DOC_TYPES[docType]?.icon || FileText;
                  return (
                    <div key={section.id} className={`p-3 rounded-xl border-2 transition-colors ${section.imported ? "bg-green-50 border-green-300" : "bg-slate-50 border-slate-200 hover:border-indigo-300"}`}>
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-sm font-semibold text-slate-800 truncate">{section.heading}</span>
                            {section.mapped_to && (
                              <Badge variant="outline" className="text-xs">
                                → {section.mapped_to.replace(/_/g, " ")}
                              </Badge>
                            )}
                            <Badge className={
                              section.status === "complete" ? "bg-green-100 text-green-700" :
                              section.status === "partial" ? "bg-amber-100 text-amber-700" :
                              "bg-red-100 text-red-700"
                            }>{section.status}</Badge>
                            {section.imported && <Badge className="bg-green-100 text-green-700">✓ Imported</Badge>}
                          </div>
                          {section.excerpt && (
                            <p className="text-xs text-slate-500 italic line-clamp-2">{section.excerpt}</p>
                          )}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          {!section.imported && section.mapped_to && project && (
                            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-xs h-7 gap-1"
                              onClick={() => importSection(section)}
                              disabled={!!importing[section.id]}>
                              {importing[section.id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                              Import
                            </Button>
                          )}
                          {!section.mapped_to && (
                            <span className="text-xs text-slate-400 self-center">No mapping</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Import History */}
          {importHistory.length > 0 && (
            <Card className="border border-green-200">
              <CardContent className="p-3">
                <div className="text-xs font-semibold text-green-700 mb-2 flex items-center gap-1">
                  <History className="w-3 h-3" />Import History ({importHistory.length})
                </div>
                {importHistory.map((h, i) => (
                  <div key={i} className="text-xs text-slate-600 flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    "{h.heading}" → {h.mapped_to}
                    <span className="text-slate-400 ml-auto">{new Date(h.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Help text when nothing uploaded */}
      {!extracted && !uploading && (
        <div className="grid md:grid-cols-3 gap-3">
          {[
            { icon: Upload, title: "Upload existing work", desc: "Import protocols, manuscripts, or thesis synopses to continue where you left off" },
            { icon: Brain, title: "AI section mapping", desc: "AI detects headings and maps content to the correct research project fields" },
            { icon: CheckCircle2, title: "Gap identification", desc: "See exactly what's complete, incomplete, or missing — with recommended next steps" },
          ].map(card => (
            <div key={card.title} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <card.icon className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <div className="text-sm font-semibold text-slate-700 mb-1">{card.title}</div>
              <div className="text-xs text-slate-500">{card.desc}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}