import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Cpu, Plus, Trash2, Pencil, Sparkles, FileUp,
  CheckCircle, AlertCircle, Loader2, X, ChevronDown, ChevronUp,
  Search, Eye, EyeOff, FlaskConical, FileText
} from "lucide-react";
import { toast } from "sonner";
import { generateCIEEPathway, validatePathway } from "@/lib/CIEEGenerator";
import CIEEEngineRunner from "@/components/clinical-ai/CIEEEngineRunner";

const GROUPS = [
  "Emergency & Electrolytes", "Glomerular Disease", "CKD & Genetics",
  "CAKUT & Urology", "Tubular & Metabolic", "Hypertension",
  "RRT & Dialysis", "Nutrition & Diet", "Rheumatology", "General Pediatrics"
];

const EMPTY_ENGINE = {
  label: "", desc: "", scenario: "", group: "Tubular & Metabolic",
  tags: [], summary: "", keys: [], references: "", is_active: true
};

function EngineForm({ engine, onChange }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs font-semibold">Engine Label *</Label>
          <Input value={engine.label} onChange={e => onChange({ ...engine, label: e.target.value })}
            placeholder="e.g. Rickets Engine" className="mt-1 text-sm" />
        </div>
        <div>
          <Label className="text-xs font-semibold">Scenario ID *</Label>
          <Input value={engine.scenario} onChange={e => onChange({ ...engine, scenario: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
            placeholder="e.g. rickets-engine" className="mt-1 text-sm font-mono" />
          <p className="text-xs text-slate-400 mt-0.5">Used in URL: ?scenario=your-id</p>
        </div>
      </div>
      <div>
        <Label className="text-xs font-semibold">Short Description</Label>
        <Input value={engine.desc} onChange={e => onChange({ ...engine, desc: e.target.value })}
          placeholder="e.g. Calcipenic vs Phosphopenic — VDDR · XLH · Burosumab" className="mt-1 text-sm" />
      </div>
      <div>
        <Label className="text-xs font-semibold">Group</Label>
        <Select value={engine.group} onValueChange={v => onChange({ ...engine, group: v })}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>{GROUPS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs font-semibold">Summary (for pathway card)</Label>
        <Textarea value={engine.summary} onChange={e => onChange({ ...engine, summary: e.target.value })}
          placeholder="Full algorithm overview..." className="mt-1 text-sm h-16 resize-none" />
      </div>
      <div>
        <Label className="text-xs font-semibold">Key Points (one per line)</Label>
        <Textarea value={(engine.keys || []).join("\n")} onChange={e => onChange({ ...engine, keys: e.target.value.split("\n") })}
          placeholder="Key point 1&#10;Key point 2" className="mt-1 text-sm h-20 resize-none" />
      </div>
      <div>
        <Label className="text-xs font-semibold">Search Tags (comma separated)</Label>
        <Input value={(engine.tags || []).join(", ")} onChange={e => onChange({ ...engine, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })}
          placeholder="rickets, XLH, vitamin D, phosphate" className="mt-1 text-sm" />
      </div>
      <div>
        <Label className="text-xs font-semibold">References / Guidelines</Label>
        <Input value={engine.references || ""} onChange={e => onChange({ ...engine, references: e.target.value })}
          placeholder="e.g. IAP STG 2022, KDIGO 2024" className="mt-1 text-sm" />
      </div>
      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
        <div>
          <p className="text-xs font-semibold text-slate-700">Visible in Hub &amp; Pathways</p>
          <p className="text-xs text-slate-400">Toggle off to hide from all clinical views</p>
        </div>
        <button
          type="button"
          onClick={() => onChange({ ...engine, is_active: !engine.is_active })}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            engine.is_active
              ? "bg-green-100 text-green-700 border border-green-300"
              : "bg-slate-100 text-slate-500 border border-slate-300"
          }`}
        >
          {engine.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          {engine.is_active ? "Active" : "Hidden"}
        </button>
      </div>
    </div>
  );
}

// Converts a CustomSection DB record → engine config object
function recordToEngine(rec) {
  const c = rec.content || {};
  return {
    _id: rec.id,
    label: rec.title || c.label || "",
    desc: rec.description || c.desc || "",
    scenario: c.scenario || "",
    group: c.group || "General Pediatrics",
    tags: c.tags || [],
    summary: c.summary || "",
    keys: c.keys || [],
    references: c.references || "",
    ciee_pathway: c.ciee_pathway || null,
    ciee_sources: c.ciee_sources || null,
    guideline_source: c.guideline_source || null,
    is_active: rec.status === "published",
  };
}

// Converts engine config → CustomSection fields for DB save
function engineToRecord(engine) {
  return {
    title: engine.label,
    description: engine.desc,
    name: engine.scenario,
    section_type: "tool",
    created_by_admin: true,
    status: engine.is_active ? "published" : "draft",
    content: {
      label: engine.label,
      desc: engine.desc,
      scenario: engine.scenario,
      group: engine.group,
      tags: engine.tags || [],
      summary: engine.summary || "",
      keys: engine.keys || [],
      references: engine.references || "",
      // CIEE executable decision graph (Component 2 output)
      ciee_pathway: engine.ciee_pathway || null,
      ciee_sources: engine.ciee_sources || null,
      guideline_source: engine.guideline_source || null,
    },
  };
}

export default function EngineGenerator() {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState(null);
  const [aiMode, setAiMode] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiDocText, setAiDocText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [llmTestResult, setLlmTestResult] = useState(null);
  const [llmTesting, setLlmTesting] = useState(false);
  // CIEE decision-graph generation
  const [cieeMode, setCieeMode] = useState(false);
  const [cieeGen, setCieeGen] = useState(null);        // { guideline_source, sources, engine, pathway }
  const [cieeValidation, setCieeValidation] = useState(null);
  const [cieeGenLoading, setCieeGenLoading] = useState(false);
  const [runnerGraph, setRunnerGraph] = useState(null); // graph being run live

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me(), staleTime: 60000 });
  const isAdmin = user?.role === "admin";

  // Load engines from DB (CustomSection where created_by_admin = true and section_type = "tool")
  const { data: dbRecords = [], isLoading } = useQuery({
    queryKey: ["custom_engines_db"],
    queryFn: () => base44.entities.CustomSection.filter({ created_by_admin: true, section_type: "tool" }),
    enabled: isAdmin,
  });

  const engines = dbRecords.map(recordToEngine);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CustomSection.create(engineToRecord(data)),
    onSuccess: () => { queryClient.invalidateQueries(["custom_engines_db"]); toast.success("Engine saved to database"); setModal(null); },
    onError: (e) => toast.error("Save failed: " + e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CustomSection.update(id, engineToRecord(data)),
    onSuccess: () => { queryClient.invalidateQueries(["custom_engines_db"]); toast.success("Engine updated"); setModal(null); },
    onError: (e) => toast.error("Update failed: " + e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CustomSection.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(["custom_engines_db"]); toast.success("Engine deleted"); },
    onError: (e) => toast.error("Delete failed: " + e.message),
  });

  const toggleVisibility = (eng) => {
    updateMutation.mutate({ id: eng._id, data: { ...eng, is_active: !eng.is_active } });
  };

  const handleSave = () => {
    if (!modal.engine.label.trim() || !modal.engine.scenario.trim()) {
      toast.error("Label and Scenario ID are required");
      return;
    }
    if (modal.mode === "add") {
      createMutation.mutate(modal.engine);
    } else {
      updateMutation.mutate({ id: modal.engine._id, data: modal.engine });
    }
  };

  const handleDelete = (eng) => {
    if (!confirm("Delete this engine from the database?")) return;
    deleteMutation.mutate(eng._id);
  };

  const generateWithAI = async () => {
    if (!aiTopic.trim()) { toast.error("Enter a topic first"); return; }
    setAiLoading(true);
    try {
      const prompt = `You are a clinical engine configuration generator for a pediatric nephrology app.
Generate a structured engine configuration for the following clinical topic:

Topic: ${aiTopic}
${aiDocText ? `\nAdditional context / document content:\n${aiDocText.substring(0, 3000)}` : ""}

Return a JSON object with EXACTLY these fields:
{
  "label": "Short engine name (3-5 words)",
  "desc": "One-line description of what the engine covers",
  "scenario": "url-slug-lowercase-with-hyphens",
  "group": "One of: Emergency & Electrolytes, Glomerular Disease, CKD & Genetics, CAKUT & Urology, Tubular & Metabolic, Hypertension, RRT & Dialysis, Nutrition & Diet, Rheumatology, General Pediatrics",
  "summary": "2-3 sentence clinical summary of the algorithm",
  "keys": ["Key clinical point 1", "Key clinical point 2", "Key clinical point 3", "Key clinical point 4"],
  "tags": ["search", "tag1", "tag2", "tag3", "tag4"],
  "references": "Main guideline sources"
}

Return ONLY valid JSON, no explanation.`;

      const response = await base44.integrations.Core.InvokeLLM({ prompt, response_json_schema: {
        type: "object",
        properties: {
          label: { type: "string" }, desc: { type: "string" }, scenario: { type: "string" },
          group: { type: "string" }, summary: { type: "string" },
          keys: { type: "array", items: { type: "string" } },
          tags: { type: "array", items: { type: "string" } },
          references: { type: "string" }
        }
      }});

      const parsed = typeof response === "string" ? JSON.parse(response) : response;
      setModal({ mode: "add", engine: { ...EMPTY_ENGINE, ...parsed, is_active: true } });
      setAiMode(false);
      toast.success("AI generated engine config — review and save");
    } catch (err) {
      toast.error("AI generation failed: " + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  // ── Build an executable CIEE decision graph from the guideline (Component 2) ──
  const generateCIEEEngine = async () => {
    if (!aiTopic.trim() && !aiDocText.trim()) { toast.error("Enter a topic or upload a guideline first"); return; }
    setCieeGenLoading(true);
    setCieeGen(null); setCieeValidation(null);
    try {
      toast.info("Parsing guideline into a decision graph…");
      const res = await generateCIEEPathway({ topic: aiTopic, guidelineText: aiDocText });
      if (!res.success) { toast.error("Generation failed: " + res.error); return; }
      setCieeGen(res.data);
      setCieeValidation(res.validation);
      if (res.validation?.valid) toast.success(`Decision graph generated — ${res.validation.nodeCount} nodes`);
      else toast.warning(`Generated with ${res.validation?.errors?.length || 0} graph issue(s) — review below`);
    } catch (err) {
      toast.error("Generation failed: " + err.message);
    } finally {
      setCieeGenLoading(false);
    }
  };

  const saveCIEEEngine = () => {
    if (!cieeGen) return;
    const eng = cieeGen.engine || {};
    createMutation.mutate({
      ...EMPTY_ENGINE,
      label: eng.label || cieeGen.guideline_source?.guideline_name || "Generated Engine",
      desc: eng.desc || cieeGen.guideline_source?.guideline_name || "",
      scenario: (eng.scenario || (eng.label || "engine").toLowerCase().replace(/\s+/g, "-")),
      group: eng.group || "General Pediatrics",
      references: cieeGen.guideline_source ? `${cieeGen.guideline_source.issuing_body} ${cieeGen.guideline_source.year || ""}` : "",
      summary: `CIEE decision engine · ${Object.keys(cieeGen.pathway.nodes).length} nodes`,
      tags: ["ciee", "decision-engine"],
      is_active: true,
      ciee_pathway: cieeGen.pathway,
      ciee_sources: cieeGen.sources,
      guideline_source: cieeGen.guideline_source,
    });
  };

  const runLLMTest = async () => {
    setLlmTesting(true);
    setLlmTestResult(null);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: "In one sentence, confirm you are an active AI assistant for a pediatric nephrology clinical platform.",
      });
      let text = "";
      if (typeof response === "string") text = response;
      else if (response?.result) text = response.result;
      else if (response?.text) text = response.text;
      else if (response?.content) text = response.content;
      else if (response?.choices?.[0]?.message?.content) text = response.choices[0].message.content;
      else text = JSON.stringify(response);
      setLlmTestResult({ ok: true, text });
      toast.success("LLM service is active and responding");
    } catch (err) {
      setLlmTestResult({ ok: false, text: err.message });
      toast.error("LLM service test failed: " + err.message);
    } finally {
      setLlmTesting(false);
    }
  };

  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfFileName, setPdfFileName] = useState("");

  const handleDocUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // For PDF files, upload and extract via AI
    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      setPdfUploading(true);
      setPdfFileName(file.name);
      try {
        toast.info("Uploading PDF and extracting content…");
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
          file_url,
          json_schema: {
            type: "object",
            properties: {
              extracted_text: { type: "string", description: "All meaningful clinical text from the document, including guidelines, protocols, dosing, diagnosis criteria, management steps" }
            }
          }
        });
        const text = result?.output?.extracted_text || result?.output?.[0]?.extracted_text || "";
        if (text) {
          setAiDocText(text.substring(0, 6000));
          toast.success(`PDF extracted: ${file.name}`);
        } else {
          toast.error("Could not extract text from PDF");
        }
      } catch (err) {
        toast.error("PDF extraction failed: " + err.message);
      } finally {
        setPdfUploading(false);
      }
    } else {
      // Plain text / markdown / csv
      try {
        const text = await file.text();
        setAiDocText(text.substring(0, 6000));
        setPdfFileName(file.name);
        toast.success("Document loaded: " + file.name);
      } catch {
        toast.error("Could not read file");
      }
    }
    e.target.value = "";
  };

  const filtered = engines.filter(eng =>
    !search || eng.label?.toLowerCase().includes(search.toLowerCase()) ||
    eng.desc?.toLowerCase().includes(search.toLowerCase()) ||
    (eng.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Card className="max-w-sm w-full border-red-200">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="font-semibold text-slate-800">Admin Access Required</p>
            <p className="text-sm text-slate-500 mt-1">This page is restricted to admin users only.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeCount = engines.filter(e => e.is_active).length;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-3xl mx-auto px-4 py-5 space-y-5">

        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-r from-violet-700 to-indigo-700 p-5 text-white">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Cpu className="w-6 h-6" />
              <div>
                <h1 className="text-lg font-bold">Engine Generator</h1>
                <p className="text-violet-200 text-xs">Admin tool — Add, edit, toggle &amp; delete clinical intelligence engines (saved to database)</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <a href="/CIEEEngines" className="text-[11px] font-semibold bg-white/20 hover:bg-white/30 border border-white/30 rounded-full px-2.5 py-1 flex items-center gap-1">
                <FlaskConical className="w-3 h-3" /> CIEE Engines Hub
              </a>
              <Badge className="bg-white/20 text-white text-xs border border-white/30">{engines.length} Total</Badge>
            </div>
          </div>
        </div>

        {/* LLM Test Panel */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-xs font-semibold text-blue-900">AI / LLM Service Health Check</p>
                  <p className="text-xs text-blue-600">Verify the LLM integration is active and responding</p>
                </div>
              </div>
              <Button size="sm" onClick={runLLMTest} disabled={llmTesting}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs shrink-0">
                {llmTesting ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Testing...</> : "Run Test"}
              </Button>
            </div>
            {llmTestResult && (
              <div className={`mt-2 p-2 rounded-lg text-xs flex items-start gap-2 ${llmTestResult.ok ? "bg-green-100 text-green-800 border border-green-200" : "bg-red-100 text-red-800 border border-red-200"}`}>
                {llmTestResult.ok ? <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />}
                <span>{llmTestResult.text}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => setModal({ mode: "add", engine: { ...EMPTY_ENGINE } })}
            className="bg-violet-600 hover:bg-violet-700 gap-1.5 text-sm">
            <Plus className="w-4 h-4" /> Add Engine Manually
          </Button>
          <Button onClick={() => setAiMode(v => !v)} variant="outline"
            className="border-violet-300 text-violet-700 hover:bg-violet-50 gap-1.5 text-sm">
            <Sparkles className="w-4 h-4" /> {aiMode ? "Hide" : "Generate Metadata (AI)"}
          </Button>
          <Button onClick={() => setCieeMode(v => !v)} variant="outline"
            className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 gap-1.5 text-sm">
            <FlaskConical className="w-4 h-4" /> {cieeMode ? "Hide" : "Build Decision Engine (CIEE)"}
          </Button>
        </div>

        {/* AI Generation Panel */}
        {aiMode && (
          <Card className="border-violet-200 bg-violet-50">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm flex items-center gap-2 text-violet-900">
                <Sparkles className="w-4 h-4" /> AI Engine Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              <div>
                <Label className="text-xs font-semibold text-violet-800">Clinical Topic *</Label>
                <Input value={aiTopic} onChange={e => setAiTopic(e.target.value)}
                  placeholder="e.g. Bartter Syndrome, Neonatal Rickets, ANCA Vasculitis..."
                  className="mt-1 bg-white border-violet-200 text-sm" />
              </div>
              <div>
                <Label className="text-xs font-semibold text-violet-800">Paste guideline / document text (optional)</Label>
                <Textarea value={aiDocText} onChange={e => setAiDocText(e.target.value)}
                  placeholder="Paste extracted text from a PDF guideline, abstract, or any clinical document..."
                  className="mt-1 bg-white border-violet-200 text-sm h-24 resize-none" />
              </div>
              <div className="flex gap-2 items-center flex-wrap">
                <label className={`flex items-center gap-1.5 cursor-pointer px-3 py-2 border rounded-lg text-xs font-medium transition-colors ${pdfUploading ? "border-violet-200 bg-violet-50 text-violet-400 cursor-not-allowed" : "border-violet-300 bg-white text-violet-700 hover:bg-violet-50"}`}>
                  {pdfUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileUp className="w-3.5 h-3.5" />}
                  {pdfUploading ? "Extracting PDF…" : "Upload PDF / Doc"}
                  <input type="file" accept=".txt,.md,.csv,.pdf" className="hidden" onChange={handleDocUpload} disabled={pdfUploading} />
                </label>
                {pdfFileName && !pdfUploading && (
                  <div className="flex items-center gap-1 text-xs text-violet-700 bg-violet-100 px-2 py-1 rounded-full border border-violet-200">
                    <FileText className="w-3 h-3" /> {pdfFileName}
                    <button onClick={() => { setAiDocText(""); setPdfFileName(""); }} className="ml-1 text-violet-400 hover:text-violet-700">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {!pdfFileName && <span className="text-xs text-violet-500">or paste above · PDF, TXT, MD supported</span>}
              </div>
              <Button onClick={generateWithAI} disabled={aiLoading}
                className="w-full bg-violet-700 hover:bg-violet-800 gap-2">
                {aiLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Engine Config</>}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* CIEE Decision-Graph Builder */}
        {cieeMode && (
          <Card className="border-indigo-200 bg-indigo-50">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm flex items-center gap-2 text-indigo-900">
                <FlaskConical className="w-4 h-4" /> CIEE Decision-Engine Builder
              </CardTitle>
              <p className="text-xs text-indigo-600">
                Parses an uploaded guideline into an <strong>executable decision graph</strong> (GuidelineSource + DecisionNode processor) — runnable by the same PathwayExecutionEngine, with prescription suppression, monitoring schedules and node-level evidence traceability.
              </p>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              <div>
                <Label className="text-xs font-semibold text-indigo-800">Clinical Topic</Label>
                <Input value={aiTopic} onChange={e => setAiTopic(e.target.value)}
                  placeholder="e.g. KDIGO AKI 2023, IPNA SRNS, Bartter Syndrome…"
                  className="mt-1 bg-white border-indigo-200 text-sm" />
              </div>
              <div>
                <Label className="text-xs font-semibold text-indigo-800">Guideline text (paste or upload PDF/doc)</Label>
                <Textarea value={aiDocText} onChange={e => setAiDocText(e.target.value)}
                  placeholder="Paste guideline content, or use Upload below…"
                  className="mt-1 bg-white border-indigo-200 text-sm h-24 resize-none" />
              </div>
              <div className="flex gap-2 items-center flex-wrap">
                <label className={`flex items-center gap-1.5 cursor-pointer px-3 py-2 border rounded-lg text-xs font-medium transition-colors ${pdfUploading ? "border-indigo-200 bg-indigo-50 text-indigo-400 cursor-not-allowed" : "border-indigo-300 bg-white text-indigo-700 hover:bg-indigo-50"}`}>
                  {pdfUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileUp className="w-3.5 h-3.5" />}
                  {pdfUploading ? "Extracting PDF…" : "Upload Guideline PDF / Doc"}
                  <input type="file" accept=".txt,.md,.csv,.pdf" className="hidden" onChange={handleDocUpload} disabled={pdfUploading} />
                </label>
                {pdfFileName && !pdfUploading && (
                  <div className="flex items-center gap-1 text-xs text-indigo-700 bg-indigo-100 px-2 py-1 rounded-full border border-indigo-200">
                    <FileText className="w-3 h-3" /> {pdfFileName}
                    <button onClick={() => { setAiDocText(""); setPdfFileName(""); }} className="ml-1 text-indigo-400 hover:text-indigo-700"><X className="w-3 h-3" /></button>
                  </div>
                )}
              </div>
              <Button onClick={generateCIEEEngine} disabled={cieeGenLoading}
                className="w-full bg-indigo-700 hover:bg-indigo-800 gap-2">
                {cieeGenLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Parsing guideline → decision graph…</> : <><Cpu className="w-4 h-4" /> Generate CIEE Decision Graph</>}
              </Button>

              {/* Generated graph preview */}
              {cieeGen && (
                <div className="space-y-2 pt-1">
                  {/* validation */}
                  <div className={`rounded-lg p-2 text-xs border ${cieeValidation?.valid ? "bg-green-50 border-green-200 text-green-800" : "bg-amber-50 border-amber-200 text-amber-800"}`}>
                    <div className="flex items-center gap-1.5 font-semibold">
                      {cieeValidation?.valid ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                      {cieeValidation?.valid ? `Valid runnable graph · ${cieeValidation.nodeCount} nodes` : `Graph has ${cieeValidation?.errors?.length || 0} issue(s)`}
                    </div>
                    {(cieeValidation?.errors || []).map((e, i) => <p key={i} className="mt-0.5">• {e}</p>)}
                    {(cieeValidation?.warnings || []).map((w, i) => <p key={i} className="mt-0.5 text-amber-600">⚠ {w}</p>)}
                  </div>

                  {/* guideline source */}
                  <div className="bg-white rounded-lg p-2 border border-indigo-100 text-xs">
                    <p className="font-semibold text-indigo-900">{cieeGen.guideline_source?.guideline_name}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <Badge variant="outline" className="text-[9px] py-0">{cieeGen.guideline_source?.issuing_body} {cieeGen.guideline_source?.year}</Badge>
                      {cieeGen.guideline_source?.evidence_grade && <Badge variant="outline" className="text-[9px] py-0">Grade {cieeGen.guideline_source.evidence_grade}</Badge>}
                      {cieeGen.guideline_source?.pmid && <span className="text-[9px] text-slate-400 self-center">PMID {cieeGen.guideline_source.pmid}</span>}
                    </div>
                  </div>

                  {/* node list */}
                  <div className="bg-white rounded-lg p-2 border border-indigo-100 max-h-48 overflow-y-auto">
                    {Object.values(cieeGen.pathway.nodes).map((n) => (
                      <div key={n.id} className="text-[11px] flex items-start gap-1.5 py-0.5 border-b border-slate-50 last:border-0">
                        <span className="font-bold text-indigo-700 shrink-0">{n.id}</span>
                        <span className="text-[8px] font-bold uppercase text-slate-400 shrink-0 mt-0.5">{n.type}</span>
                        <span className="text-slate-700">{n.question || n.action}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => setRunnerGraph(cieeGen)} variant="outline"
                      className="flex-1 border-indigo-300 text-indigo-700 hover:bg-indigo-50 gap-1.5 text-sm">
                      <Eye className="w-4 h-4" /> Run / Preview Pathway
                    </Button>
                    <Button onClick={saveCIEEEngine} disabled={createMutation.isPending || !cieeValidation?.valid}
                      className="flex-1 bg-indigo-700 hover:bg-indigo-800 gap-1.5 text-sm">
                      {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Save Engine
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Search */}
        {engines.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search engines..." className="pl-9 bg-white" />
          </div>
        )}

        {/* Engine List */}
        {isLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-violet-500" /></div>
        ) : engines.length === 0 ? (
          <Card className="border-dashed border-2 border-slate-200">
            <CardContent className="p-8 text-center">
              <Cpu className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No custom engines yet</p>
              <p className="text-slate-400 text-sm mt-1">Add engines manually or generate with AI above</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-slate-500 font-medium">{filtered.length} engine{filtered.length !== 1 ? "s" : ""}</p>
            {filtered.map((eng, idx) => (
              <Card key={eng._id || idx} className={`border-l-4 ${eng.is_active ? "border-l-violet-500 border-violet-200" : "border-l-slate-300 border-slate-200 opacity-70"}`}>
                <CardContent className="p-0">
                  <button onClick={() => setExpanded(expanded === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-3 text-left">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Cpu className={`w-4 h-4 flex-shrink-0 ${eng.is_active ? "text-violet-600" : "text-slate-400"}`} />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-slate-800 truncate">{eng.label}</p>
                        <p className="text-xs text-slate-400 truncate">{eng.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                      {eng.ciee_pathway && <Badge className="text-xs bg-indigo-100 text-indigo-700">CIEE</Badge>}
                      <Badge variant="outline" className="text-xs">{eng.group}</Badge>
                      <Badge className={`text-xs ${eng.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                        {eng.is_active ? "Active" : "Hidden"}
                      </Badge>
                      {expanded === idx ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </button>
                  {expanded === idx && (
                    <div className="border-t border-slate-100 px-3 pb-3 pt-2 space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><span className="font-semibold text-slate-500">Scenario ID: </span><span className="font-mono text-violet-700">{eng.scenario}</span></div>
                        <div><span className="font-semibold text-slate-500">References: </span><span className="text-slate-600">{eng.references || "—"}</span></div>
                      </div>
                      {eng.summary && <p className="text-xs text-slate-600 italic">{eng.summary}</p>}
                      {(eng.keys || []).filter(k => k.trim()).length > 0 && (
                        <ul className="space-y-0.5">
                          {eng.keys.filter(k => k.trim()).map((k, j) => (
                            <li key={j} className="text-xs text-slate-700 flex gap-1.5"><span className="text-violet-400">→</span>{k}</li>
                          ))}
                        </ul>
                      )}
                      {(eng.tags || []).length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {eng.tags.map((t, j) => <Badge key={j} variant="outline" className="text-xs py-0">{t}</Badge>)}
                        </div>
                      )}
                      <div className="flex gap-2 pt-1 flex-wrap">
                        {eng.ciee_pathway && (
                          <Button size="sm" variant="outline" className="text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50 h-7"
                            onClick={() => setRunnerGraph({ pathway: eng.ciee_pathway, sources: eng.ciee_sources || {}, guideline_source: eng.guideline_source, engine: { label: eng.label } })}>
                            <FlaskConical className="w-3 h-3 mr-1" /> Run Pathway
                          </Button>
                        )}
                        <Button size="sm" variant="outline"
                          className={`text-xs h-7 ${eng.is_active ? "border-slate-200 text-slate-600 hover:bg-slate-50" : "border-green-200 text-green-700 hover:bg-green-50"}`}
                          onClick={() => toggleVisibility(eng)}
                          disabled={updateMutation.isPending}>
                          {eng.is_active ? <><EyeOff className="w-3 h-3 mr-1" />Hide from Hub</> : <><Eye className="w-3 h-3 mr-1" />Show in Hub</>}
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs border-amber-200 text-amber-700 hover:bg-amber-50 h-7"
                          onClick={() => setModal({ mode: "edit", engine: { ...eng } })}>
                          <Pencil className="w-3 h-3 mr-1" /> Edit
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs border-red-200 text-red-600 hover:bg-red-50 h-7"
                          onClick={() => handleDelete(eng)} disabled={deleteMutation.isPending}>
                          <Trash2 className="w-3 h-3 mr-1" /> Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Info card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3">
            <div className="flex gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-800 space-y-1">
                <p className="font-semibold">How engines work</p>
                <p>Engines are saved to the database (CustomSection entity) and visible to all users when set to <strong>Active</strong>. Hidden engines are stored as drafts and not shown in the Hub or pathways.</p>
                <p>The <span className="font-mono bg-blue-100 px-1 rounded">scenario</span> ID links to the engine component via <span className="font-mono bg-blue-100 px-1 rounded">?scenario=your-id</span>. To wire a custom engine to a full React component, register its scenario ID in <span className="font-mono bg-blue-100 px-1 rounded">PathwayRenderer</span>.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CIEE Pathway Runner Modal */}
      {runnerGraph && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-3 pb-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-indigo-600" />
                {runnerGraph.engine?.label || runnerGraph.guideline_source?.guideline_name || "CIEE Pathway"}
              </h3>
              <button onClick={() => setRunnerGraph(null)} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4">
              <CIEEEngineRunner
                pathway={runnerGraph.pathway}
                sources={runnerGraph.sources || {}}
                initialCtx={{}}
                title={runnerGraph.engine?.label || "CIEE Pathway Engine"}
                subtitle={runnerGraph.guideline_source?.guideline_name}
                onReset={() => setRunnerGraph({ ...runnerGraph })}
              />
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-3 pb-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-violet-600" />
                {modal.mode === "add" ? "Add New Engine" : "Edit Engine"}
              </h3>
              <button onClick={() => setModal(null)} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4">
              <EngineForm engine={modal.engine} onChange={eng => setModal(m => ({ ...m, engine: eng }))} />
              <div className="flex gap-2 mt-4">
                <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 bg-violet-600 hover:bg-violet-700 gap-1.5">
                  {(createMutation.isPending || updateMutation.isPending)
                    ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
                    : <><CheckCircle className="w-4 h-4" />Save to Database</>}
                </Button>
                <Button onClick={() => setModal(null)} variant="outline">Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}